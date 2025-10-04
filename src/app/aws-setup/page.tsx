// AWS Setup Guide Page
'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AWSSetupPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AWS Credentials Setup Guide
          </h1>
          <p className="text-gray-600">
            Configure AWS credentials to access real CCHMC Pediatric Surgery content
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Status */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Current Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm">AWS credentials not configured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">AI Assistant working with mock content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Development server running</span>
              </div>
            </div>
          </Card>

          {/* Quick Setup */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold">Quick Setup</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Add to .env.local file:</h3>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span>Environment Variables</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
AWS_REGION=us-east-1`)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="text-gray-700">
                    AWS_ACCESS_KEY_ID=your-access-key-here<br/>
                    AWS_SECRET_ACCESS_KEY=your-secret-key-here<br/>
                    AWS_REGION=us-east-1
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">2. Restart development server:</h3>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>pnpm dev</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('pnpm dev')}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Instructions */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Detailed Instructions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Step 1: Get AWS Credentials</h3>
              <p className="text-gray-600 mb-2">
                You'll need AWS credentials with access to the S3 bucket containing CCHMC content.
              </p>
              <Badge variant="outline">Required: S3 Read Access</Badge>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Step 2: Configure Environment Variables</h3>
              <p className="text-gray-600 mb-2">
                Create or update your <code className="bg-gray-100 px-1 rounded">.env.local</code> file in the project root:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <div className="text-gray-500 mb-2"># AWS Configuration</div>
                <div>AWS_ACCESS_KEY_ID=AKIA...</div>
                <div>AWS_SECRET_ACCESS_KEY=...</div>
                <div>AWS_REGION=us-east-1</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Step 3: Verify Setup</h3>
              <p className="text-gray-600 mb-2">
                After restarting the server, test the setup:
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open('/api/test-aws', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test AWS Config
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/ai-assistant', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test AI Assistant
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Troubleshooting */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Still seeing mock content?</h3>
                <p className="text-gray-600 text-sm">
                  Make sure you've restarted the development server after adding credentials.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Getting AWS errors?</h3>
                <p className="text-gray-600 text-sm">
                  Verify your credentials have the correct permissions for the S3 bucket.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Need help?</h3>
                <p className="text-gray-600 text-sm">
                  Check the browser console for detailed error messages.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
