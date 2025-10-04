'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Volume2,
  Bot
} from 'lucide-react';

export default function ElevenLabsSetupPage() {
  const [elevenLabsConfigured, setElevenLabsConfigured] = useState(false);
  const [voiceAssistantWorking, setVoiceAssistantWorking] = useState(false);

  useEffect(() => {
    // Test ElevenLabs TTS
    const testElevenLabs = async () => {
      try {
        const response = await fetch('/api/elevenlabs-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Test' }),
        });
        setElevenLabsConfigured(response.ok);
      } catch (error) {
        setElevenLabsConfigured(false);
      }
    };

    // Test voice assistant
    const testVoiceAssistant = async () => {
      try {
        const response = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'test' }),
        });
        setVoiceAssistantWorking(response.ok);
      } catch (error) {
        setVoiceAssistantWorking(false);
      }
    };

    testElevenLabs();
    testVoiceAssistant();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ElevenLabs Voice Setup
          </h1>
          <p className="text-xl text-gray-300">
            Configure natural AI voice for Sarah
          </p>
        </div>

        {/* Current Status */}
        <Card className="bg-gray-800/50 border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              {elevenLabsConfigured ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <p className="text-white font-medium">ElevenLabs TTS</p>
                <p className="text-gray-400 text-sm">
                  {elevenLabsConfigured ? 'Configured and working' : 'Not configured'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {voiceAssistantWorking ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <p className="text-white font-medium">Voice Assistant</p>
                <p className="text-gray-400 text-sm">
                  {voiceAssistantWorking ? 'Working with natural voice' : 'Using fallback voice'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Setup */}
        <Card className="bg-gray-800/50 border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Setup</h2>
          <div className="space-y-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">1. Get ElevenLabs API Key</h3>
              <p className="text-gray-300 mb-3">
                Sign up at ElevenLabs and get your API key from the dashboard.
              </p>
              <Button
                onClick={() => window.open('https://elevenlabs.io/app/settings/api-keys', '_blank')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get API Key
              </Button>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">2. Add to Environment Variables</h3>
              <p className="text-gray-300 mb-3">
                Add your ElevenLabs API key to your .env.local file:
              </p>
              <div className="bg-black/50 p-3 rounded border border-gray-600">
                <code className="text-green-400 text-sm">
                  ELEVENLABS_API_KEY=your_api_key_here
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard('ELEVENLABS_API_KEY=your_api_key_here')}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">3. Restart Development Server</h3>
              <p className="text-gray-300">
                Restart your Next.js development server to load the new environment variable.
              </p>
            </div>
          </div>
        </Card>

        {/* Voice Features */}
        <Card className="bg-gray-800/50 border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Voice Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Volume2 className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="text-white font-medium">Natural Voice</h3>
                <p className="text-gray-400 text-sm">
                  High-quality AI voice that sounds human
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bot className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="text-white font-medium">Sarah Voice</h3>
                <p className="text-gray-400 text-sm">
                  Consistent female voice for Sarah assistant
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="text-white font-medium">Fallback Support</h3>
                <p className="text-gray-400 text-sm">
                  Browser TTS if ElevenLabs is unavailable
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="text-white font-medium">Fast Response</h3>
                <p className="text-gray-400 text-sm">
                  Optimized for quick voice generation
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Troubleshooting */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">API Key Issues</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Make sure your API key is valid and active</li>
                <li>• Check that you have sufficient credits in your ElevenLabs account</li>
                <li>• Verify the key is correctly added to .env.local</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Voice Not Working</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• The system will automatically fallback to browser TTS</li>
                <li>• Check browser console for error messages</li>
                <li>• Ensure your internet connection is stable</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• ElevenLabs TTS is faster than OpenAI TTS</li>
                <li>• Audio is cached for better performance</li>
                <li>• Fallback ensures voice always works</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Test Voice */}
        <div className="text-center mt-8">
          <Button
            onClick={() => window.location.href = '/voice-assistant'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
          >
            Test Voice Assistant
          </Button>
        </div>
      </div>
    </div>
  );
}
