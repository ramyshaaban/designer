// API route to serve S3 content metadata
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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
    const bucket = searchParams.get('bucket') || 'staycurrent-app-prod';
    const prefix = searchParams.get('prefix') || 'content/';
    const limit = parseInt(searchParams.get('limit') || '50');

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: limit,
    });

    const response = await s3Client.send(command);
    
    const contents = response.Contents?.map(obj => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
      url: `https://${bucket}.s3.amazonaws.com/${obj.Key}`,
    })) || [];

    return NextResponse.json({
      bucket,
      prefix,
      count: contents.length,
      contents,
    });
  } catch (error) {
    console.error('S3 API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch S3 content' },
      { status: 500 }
    );
  }
}
