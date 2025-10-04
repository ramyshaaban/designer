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

export default function DrSarahAssistant({ onClose }: DrSarahAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm Dr. Sarah, your Pediatric Surgery AI Assistant. I'm here to help you with questions about procedures, guidelines, and protocols. What would you like to know?",
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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Dr. Sarah</h1>
            <p className="text-blue-100 text-sm">Pediatric Surgery AI Assistant</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.resources && message.resources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm opacity-75">📚 Supporting Resources:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {message.resources.map((resource) => (
                            <Card
                              key={resource.id}
                              className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${getResourceColor(resource.type)}`}
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
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Dr. Sarah about pediatric surgery procedures, guidelines, or protocols..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Resource Viewer */}
        {selectedResource && (
          <div className="w-96 border-l bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Resource Viewer</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedResource(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getResourceIcon(selectedResource.type)}
                  <Badge className={getResourceColor(selectedResource.type)}>
                    {selectedResource.type}
                  </Badge>
                </div>
                <h4 className="font-medium text-gray-900">{selectedResource.title}</h4>
                {selectedResource.description && (
                  <p className="text-sm text-gray-600">{selectedResource.description}</p>
                )}
                <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Resource Preview</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
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
