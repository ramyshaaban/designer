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
      // Search for relevant content
      const searchResponse = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: question }),
      });

      const searchData = await searchResponse.json();
      
      if (searchData.results && searchData.results.length > 0) {
        // Generate response based on search results
        const topResults = searchData.results.slice(0, 3);
        let response = `Based on the CCHMC Pediatric Surgery protocols and guidelines, I found ${searchData.totalFound} relevant resources. `;
        
        if (topResults.length > 0) {
          response += `Here's what I can tell you about ${question}: `;
          
          // Generate contextual response based on content types found
          const hasVideos = topResults.some(r => r.type === 'video');
          const hasGuidelines = topResults.some(r => r.type === 'guideline');
          const hasDocuments = topResults.some(r => r.type === 'document');
          
          if (hasVideos) {
            response += "There are detailed video procedures available. ";
          }
          if (hasGuidelines) {
            response += "Clinical guidelines provide evidence-based protocols. ";
          }
          if (hasDocuments) {
            response += "Educational documents offer comprehensive information. ";
          }
          
          response += "I've identified the most relevant resources below to support your learning.";
        }

        // Convert search results to resources
        const resources: Resource[] = topResults.map((result: any, index: number) => ({
          id: result.id,
          title: result.title,
          type: result.type as 'video' | 'document' | 'guideline',
          url: result.fileUrl || `/api/thumbnail?id=${result.id}`,
          description: `Relevance: ${result.relevanceScore}% - ${result.matchedKeywords.join(', ')}`
        }));

        return { response, resources };
      } else {
        return {
          response: "I don't have specific information about that topic in the current CCHMC Pediatric Surgery content. Could you try rephrasing your question or ask about a different procedure?",
          resources: []
        };
      }
    } catch (error) {
      console.error('Search error:', error);
      return {
        response: "I'm having trouble accessing the content database right now. Please try again in a moment.",
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

      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 text-white p-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Sarah</h1>
            <p className="text-gray-300 text-sm">CCHMC Pediatric Surgery AI Assistant</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg' 
                      : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 border border-gray-600'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-lg p-4 backdrop-blur-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white border border-cyan-500/30'
                      : 'bg-gray-800/80 text-gray-100 border border-gray-700'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.resources && message.resources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm opacity-75">📚 Supporting Resources:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {message.resources.map((resource) => (
                            <Card
                              key={resource.id}
                              className={`p-3 cursor-pointer hover:shadow-lg transition-all duration-300 bg-gray-800/60 border border-gray-600 hover:border-cyan-500/50 hover:bg-gray-700/60 backdrop-blur-sm`}
                              onClick={() => setSelectedResource(resource)}
                            >
                              <div className="flex items-center space-x-2">
                                {getResourceIcon(resource.type)}
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{resource.title}</h4>
                                  {resource.description && (
                                    <p className="text-xs opacity-75 mt-1">{resource.description}</p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 border border-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-800/80 text-gray-100 border border-gray-700 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm p-4 relative z-10">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Sarah about pediatric surgery procedures, guidelines, or protocols..."
                className="flex-1 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Resource Viewer */}
        {selectedResource && (
          <div className="w-96 border-l border-gray-800 bg-gray-900/80 backdrop-blur-sm flex flex-col relative z-10">
            <div className="p-4 border-b border-gray-800 bg-gray-800/60 flex items-center justify-between">
              <h3 className="font-semibold text-gray-100">Resource Viewer</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedResource(null)}
                className="text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getResourceIcon(selectedResource.type)}
                  <Badge className="bg-gray-700 text-gray-200 border-gray-600">
                    {selectedResource.type}
                  </Badge>
                </div>
                <h4 className="font-medium text-gray-100">{selectedResource.title}</h4>
                {selectedResource.description && (
                  <p className="text-sm text-gray-300">{selectedResource.description}</p>
                )}
                <div className="bg-gray-800 border border-gray-700 rounded-lg h-48 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Resource Preview</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                  Open Resource
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
