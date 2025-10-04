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
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }

    // Check if key appears to be a full URL instead of an S3 key
    if (key.startsWith('http')) {
      return NextResponse.json({ error: 'Key appears to be a full URL, not an S3 key' }, { status: 400 });
    }

    // Validate that the key is within the spaces directory for security
    if (!key.startsWith('spaces/')) {
      return NextResponse.json({ error: 'Invalid key path - must start with spaces/' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: 'staycurrent-app-dev',
      Key: key,
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