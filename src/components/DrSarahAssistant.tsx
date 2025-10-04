'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Video, FileText, BookOpen, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  resources?: Resource[];
}

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'guideline';
  url: string;
  thumbnail?: string;
  description?: string;
}

interface DrSarahAssistantProps {
  onClose: () => void;
}

export default function SarahAssistant({ onClose }: DrSarahAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm Sarah, your CCHMC Pediatric Surgery AI Assistant. I'm here to help you with questions about procedures, guidelines, and protocols. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(currentQuestion);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        resources: aiResponse.resources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date(),
        resources: [],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (question: string): Promise<{ response: string; resources: Resource[] }> => {
    try {
      // Call the new AI assistant API with OpenAI integration
      const aiResponse = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: question }),
      });

      const aiData = await aiResponse.json();
      
      if (aiData.response && aiData.resources) {
        // Convert API resources to component resources
        const resources: Resource[] = aiData.resources.map((result: any) => ({
          id: result.id,
          title: result.title,
          type: result.type as 'video' | 'document' | 'guideline',
          url: result.fileUrl || `/api/thumbnail?id=${result.id}`,
          description: `Relevance: ${result.relevanceScore}% - ${result.matchedKeywords?.join(', ') || 'matched'}`
        }));

        return { 
          response: aiData.response, 
          resources 
        };
      } else {
        return {
          response: "I'm sorry, I couldn't process your question at this time. Please try again.",
          resources: []
        };
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      return {
        response: "I'm having trouble accessing the AI service right now. Please try again in a moment.",
        resources: []
      };
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'guideline': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800 border-red-200';
      case 'document': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'guideline': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      {/* Mobile-Optimized Header */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 text-white p-3 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Sarah</h1>
            <p className="text-xs text-gray-300">CCHMC Pediatric Surgery AI</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-300 hover:bg-gray-800 hover:text-white p-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Chat Area */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Messages - Mobile Optimized */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 relative z-10">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' 
                    : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300'
                }`}>
                  {message.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
                <div className={`rounded-2xl p-3 backdrop-blur-sm ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white'
                    : 'bg-gray-800/80 text-gray-100 border border-gray-700'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.resources && message.resources.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs opacity-75">📚 Resources:</p>
                      <div className="space-y-1">
                        {message.resources.slice(0, 3).map((resource) => (
                          <div
                            key={resource.id}
                            className="p-2 cursor-pointer hover:bg-gray-700/50 transition-colors rounded-lg bg-gray-800/60 border border-gray-600"
                            onClick={() => setSelectedResource(resource)}
                          >
                            <div className="flex items-center space-x-2">
                              {getResourceIcon(resource.type)}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-xs truncate">{resource.title}</h4>
                                <p className="text-xs text-gray-400 truncate">{resource.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {message.resources.length > 3 && (
                          <p className="text-xs text-gray-400 text-center">+{message.resources.length - 3} more resources</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="bg-gray-800/80 text-gray-100 border border-gray-700 rounded-2xl p-3 backdrop-blur-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Mobile Input Area */}
        <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm p-3 relative z-10">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Sarah about pediatric surgery..."
              className="flex-1 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 text-sm rounded-xl"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 rounded-xl px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Resource Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-gray-900 rounded-t-2xl border-t border-gray-800 max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-100">Resource</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedResource(null)}
                className="text-gray-300 hover:bg-gray-800 hover:text-white p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getResourceIcon(selectedResource.type)}
                  <Badge className="bg-gray-700 text-gray-200 border-gray-600 text-xs">
                    {selectedResource.type}
                  </Badge>
                </div>
                <h4 className="font-medium text-gray-100">{selectedResource.title}</h4>
                {selectedResource.description && (
                  <p className="text-sm text-gray-300">{selectedResource.description}</p>
                )}
                <div className="bg-gray-800 border border-gray-700 rounded-lg h-32 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Resource Preview</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl">
                  Open Resource
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
