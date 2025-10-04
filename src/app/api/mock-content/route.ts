// Mock content API for development when AWS credentials are not available
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Return a mock response with instructions
    const mockContent = {
      id,
      title: `Mock Content: ${id}`,
      type: 'development',
      message: 'This is a development mock response',
      instructions: {
        setup: 'To access real content, configure AWS credentials:',
        steps: [
          '1. Add AWS_ACCESS_KEY_ID to your .env.local file',
          '2. Add AWS_SECRET_ACCESS_KEY to your .env.local file', 
          '3. Add AWS_REGION to your .env.local file (e.g., us-east-1)',
          '4. Restart the development server'
        ],
        example: {
          AWS_ACCESS_KEY_ID: 'your-access-key-here',
          AWS_SECRET_ACCESS_KEY: 'your-secret-key-here',
          AWS_REGION: 'us-east-1'
        }
      },
      note: 'This is mock content for development. Real content requires AWS credentials.'
    };

    return NextResponse.json(mockContent);

  } catch (error) {
    console.error('Mock content error:', error);
    return NextResponse.json(
      { error: 'Failed to generate mock content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
