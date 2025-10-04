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
      {/* Mobile-Optimized Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-10">
          {/* Subtle Mobile Animations */}
          <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
          <div className="absolute top-2/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      <div className="max-w-sm w-full mx-4 relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 shadow-2xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Sarah</h1>
          <p className="text-sm text-gray-300 mb-4">CCHMC Pediatric Surgery AI</p>
          
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Ask Sarah about pediatric surgery procedures, guidelines, and protocols. Get intelligent answers with supporting resources.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => setIsAssistantOpen(true)}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 rounded-xl py-3"
            >
              Start Conversation
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl py-3"
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
