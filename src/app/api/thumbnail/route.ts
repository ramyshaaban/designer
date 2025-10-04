// API route to get signed URLs for S3 thumbnails
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
    const key = searchParams.get('key') || searchParams.get('id');
    
    if (!key) {
      return NextResponse.json({ error: 'Missing key or id parameter' }, { status: 400 });
    }

    // Check if key appears to be a full URL instead of an S3 key
    if (key.startsWith('http')) {
      return NextResponse.json({ error: 'Key appears to be a full URL, not an S3 key' }, { status: 400 });
    }

    // Convert ID to proper S3 key if needed
    let s3Key = key;
    if (!key.startsWith('spaces/')) {
      // If it's just an ID, construct the proper S3 key
      s3Key = `spaces/4/content/${key}`;
    }

    // Validate that the key is within the spaces directory for security
    if (!s3Key.startsWith('spaces/')) {
      return NextResponse.json({ error: 'Invalid key path - must start with spaces/' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: 'staycurrent-app-dev',
      Key: s3Key,
    });

    // Generate a signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Signed URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}