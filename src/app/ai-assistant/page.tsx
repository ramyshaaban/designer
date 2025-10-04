'use client';

import React, { useState } from 'react';
import { ArrowLeft, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SarahAssistant from '@/components/DrSarahAssistant';

export default function AIAssistantPage() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);

  if (isAssistantOpen) {
    return <SarahAssistant onClose={() => setIsAssistantOpen(false)} />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-20">
          {/* Animated Waves */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          {/* Floating Tech Elements */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Sarah</h1>
          <p className="text-gray-300 mb-6">CCHMC Pediatric Surgery AI Assistant</p>
          
          <p className="text-sm text-gray-400 mb-8">
            Sarah is ready to help you with questions about pediatric surgery procedures, 
            guidelines, and protocols. Get evidence-based answers with supporting resources.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={() => setIsAssistantOpen(true)}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0"
            >
              Start Conversation
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Space
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
