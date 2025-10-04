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
  Bot,
  Download,
  Terminal
} from 'lucide-react';

export default function FreeTTSSetupPage() {
  const [freeTTSConfigured, setFreeTTSConfigured] = useState(false);
  const [voiceAssistantWorking, setVoiceAssistantWorking] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    platform: '',
    espeakAvailable: false,
    festivalAvailable: false
  });

  useEffect(() => {
    // Test Free TTS
    const testFreeTTS = async () => {
      try {
        const response = await fetch('/api/free-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Test' }),
        });
        setFreeTTSConfigured(response.ok);
      } catch (error) {
        setFreeTTSConfigured(false);
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

    // Detect system capabilities
    const detectSystem = () => {
      const platform = navigator.platform || navigator.userAgent;
      setSystemInfo({
        platform: platform.includes('Mac') ? 'macOS' : platform.includes('Win') ? 'Windows' : 'Linux',
        espeakAvailable: false, // Will be detected server-side
        festivalAvailable: false // Will be detected server-side
      });
    };

    testFreeTTS();
    testVoiceAssistant();
    detectSystem();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getInstallCommands = () => {
    const { platform } = systemInfo;
    
    if (platform === 'macOS') {
      return {
        espeak: 'brew install espeak',
        festival: 'brew install festival'
      };
    } else if (platform === 'Windows') {
      return {
        espeak: 'winget install espeak',
        festival: 'choco install festival'
      };
    } else {
      return {
        espeak: 'sudo apt-get install espeak',
        festival: 'sudo apt-get install festival'
      };
    }
  };

  const installCommands = getInstallCommands();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Free AI Voice Setup
          </h1>
          <p className="text-xl text-gray-300">
            Configure free, open-source AI voice for Sarah
          </p>
        </div>

        {/* Current Status */}
        <Card className="bg-gray-800/50 border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              {freeTTSConfigured ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <p className="text-white font-medium">Free TTS Engine</p>
                <p className="text-gray-400 text-sm">
                  {freeTTSConfigured ? 'Configured and working' : 'Not configured'}
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
                  {voiceAssistantWorking ? 'Working with free AI voice' : 'Using browser fallback'}
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
              <h3 className="text-lg font-semibold text-white mb-2">1. Install eSpeak (Primary)</h3>
              <p className="text-gray-300 mb-3">
                eSpeak provides natural-sounding speech synthesis. Install it using your system's package manager:
              </p>
              <div className="bg-black/50 p-3 rounded border border-gray-600 mb-3">
                <code className="text-green-400 text-sm">
                  {installCommands.espeak}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(installCommands.espeak)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Terminal className="w-4 h-4" />
                <span>Run this command in your terminal</span>
              </div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">2. Install Festival (Backup)</h3>
              <p className="text-gray-300 mb-3">
                Festival provides additional voice options as a fallback:
              </p>
              <div className="bg-black/50 p-3 rounded border border-gray-600 mb-3">
                <code className="text-green-400 text-sm">
                  {installCommands.festival}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(installCommands.festival)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Terminal className="w-4 h-4" />
                <span>Optional: Install for additional voice options</span>
              </div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">3. Restart Development Server</h3>
              <p className="text-gray-300">
                Restart your Next.js development server to detect the newly installed TTS engines.
              </p>
            </div>
          </div>
        </Card>

        {/* Voice Features */}
        <Card className="bg-gray-800/50 border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Free Voice Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Volume2 className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h3 className="text-white font-medium">Natural Voice</h3>
                <p className="text-gray-400 text-sm">
                  eSpeak provides more natural speech than browser TTS
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bot className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h3 className="text-white font-medium">Female Voice</h3>
                <p className="text-gray-400 text-sm">
                  Configured for Sarah's female voice profile
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h3 className="text-white font-medium">Completely Free</h3>
                <p className="text-gray-400 text-sm">
                  No API keys, no costs, no external dependencies
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h3 className="text-white font-medium">Local Processing</h3>
                <p className="text-gray-400 text-sm">
                  All voice generation happens locally on your machine
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* System Requirements */}
        <Card className="bg-gray-800/50 border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">System Requirements</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Supported Platforms</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/30 p-3 rounded">
                  <h4 className="text-white font-medium">macOS</h4>
                  <p className="text-gray-400 text-sm">Use Homebrew package manager</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded">
                  <h4 className="text-white font-medium">Windows</h4>
                  <p className="text-gray-400 text-sm">Use winget or Chocolatey</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded">
                  <h4 className="text-white font-medium">Linux</h4>
                  <p className="text-gray-400 text-sm">Use apt, yum, or pacman</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Minimum Requirements</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• At least one TTS engine (eSpeak or Festival)</li>
                <li>• Node.js development environment</li>
                <li>• Terminal access for installation</li>
                <li>• ~50MB disk space for TTS engines</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Troubleshooting */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Installation Issues</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Make sure you have admin/sudo privileges for installation</li>
                <li>• Check that your package manager is up to date</li>
                <li>• Verify the TTS engine is in your system PATH</li>
                <li>• Try installing both eSpeak and Festival for redundancy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Voice Not Working</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• The system will automatically fallback to browser TTS</li>
                <li>• Check browser console for error messages</li>
                <li>• Ensure TTS engines are properly installed</li>
                <li>• Restart the development server after installation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Free TTS is faster than cloud-based solutions</li>
                <li>• Audio is generated locally for better privacy</li>
                <li>• No internet connection required for voice generation</li>
                <li>• Browser TTS fallback ensures voice always works</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Test Voice */}
        <div className="text-center mt-8">
          <Button
            onClick={() => window.location.href = '/voice-assistant'}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
          >
            Test Free Voice Assistant
          </Button>
        </div>
      </div>
    </div>
  );
}
