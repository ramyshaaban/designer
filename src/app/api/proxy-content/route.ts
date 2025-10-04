// API route to proxy S3 content through our server
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Config } from '@/lib/s3-config';

const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Convert ID to proper S3 key
    let s3Key = id;
    if (!id.startsWith('spaces/')) {
      // Handle different ID formats
      if (id.includes('_')) {
        // Format: "10571_4-guideline-gas-and-flow-initiation-ECMO-protocol.pdf"
        // Convert to: "spaces/4/content/10571/4-guideline-gas-and-flow-initiation-ECMO-protocol.pdf"
        const parts = id.split('_');
        const folderId = parts[0];
        const fileName = parts.slice(1).join('_');
        s3Key = `spaces/4/content/${folderId}/${fileName}`;
      } else {
        // Format: "6037/file_7457_2022-10-20_18-12-36.mp4"
        // Convert to: "spaces/4/content/6037/file_7457_2022-10-20_18-12-36.mp4"
        s3Key = `spaces/4/content/${id}`;
      }
    }

    // Validate that the key is within the spaces directory for security
    if (!s3Key.startsWith('spaces/')) {
      return NextResponse.json({ error: 'Invalid key path - must start with spaces/' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: 'staycurrent-app-dev',
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Convert the stream to buffer using a simpler approach
    const chunks: Uint8Array[] = [];
    const stream = response.Body as any;
    
    // Use the stream's built-in methods
    if (typeof stream.transformToByteArray === 'function') {
      const byteArray = await stream.transformToByteArray();
      const buffer = Buffer.from(byteArray);
      
      // Determine content type
      const contentType = response.ContentType || 'application/octet-stream';
      
      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Content-Length', buffer.length.toString());
      
      // Add cache headers
      headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      // Add CORS headers for cross-origin requests
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET');
      headers.set('Access-Control-Allow-Headers', 'Content-Type');

      return new NextResponse(buffer, {
        status: 200,
        headers,
      });
    } else {
      return NextResponse.json({ error: 'Unsupported stream type' }, { status: 500 });
    }

  } catch (error) {
    console.error('Proxy content error:', error);
    
    // If AWS credentials are missing, return a helpful error
    if (error instanceof Error && error.message.includes('Access Key')) {
      return NextResponse.json(
        { 
          error: 'AWS credentials not configured', 
          message: 'Content access requires AWS credentials to be configured in environment variables',
          suggestion: 'Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY'
        }, 
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
