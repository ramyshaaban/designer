'use client';

import React, { useState } from 'react';
import { ArrowLeft, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DrSarahAssistant from '@/components/DrSarahAssistant';

export default function AIAssistantPage() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);

  if (isAssistantOpen) {
    return <DrSarahAssistant onClose={() => setIsAssistantOpen(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dr. Sarah</h1>
          <p className="text-gray-600 mb-6">Your Pediatric Surgery AI Assistant</p>
          
          <p className="text-sm text-gray-500 mb-8">
            Dr. Sarah is ready to help you with questions about pediatric surgery procedures, 
            guidelines, and protocols. Get evidence-based answers with supporting resources.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={() => setIsAssistantOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Start Conversation
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
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
