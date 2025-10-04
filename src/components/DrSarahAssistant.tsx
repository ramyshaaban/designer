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
  fileUrl?: string;
  description?: string;
  note?: string;
  relevanceScore?: number;
  matchedKeywords?: string[];
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
          fileUrl: result.fileUrl,
          description: `Relevance: ${result.relevanceScore}% - ${result.matchedKeywords?.join(', ') || 'matched'}`,
          note: result.note,
          relevanceScore: result.relevanceScore,
          matchedKeywords: result.matchedKeywords
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

  // Add custom styles for wave animations and full-screen
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes wavy-move {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes logo-gradient-purple {
        0% { 
          filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.8)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.4));
          transform: scale(1);
        }
        25% { 
          filter: drop-shadow(0 0 25px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 50px rgba(168, 85, 247, 0.4));
          transform: scale(1.05);
        }
        50% { 
          filter: drop-shadow(0 0 30px rgba(192, 132, 252, 0.8)) drop-shadow(0 0 60px rgba(192, 132, 252, 0.4));
          transform: scale(1.1);
        }
        75% { 
          filter: drop-shadow(0 0 25px rgba(196, 181, 253, 0.8)) drop-shadow(0 0 50px rgba(196, 181, 253, 0.4));
          transform: scale(1.05);
        }
        100% { 
          filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.8)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.4));
          transform: scale(1);
        }
      }
      
      @keyframes logo-purple-gradient {
        0% { 
          filter: 
            drop-shadow(0 0 30px rgba(147, 51, 234, 1)) 
            drop-shadow(0 0 60px rgba(147, 51, 234, 0.8))
            drop-shadow(0 0 90px rgba(147, 51, 234, 0.6))
            hue-rotate(0deg) 
            saturate(1.5) 
            brightness(1.2);
          transform: scale(1);
        }
        12.5% { 
          filter: 
            drop-shadow(0 0 35px rgba(139, 69, 219, 1)) 
            drop-shadow(0 0 70px rgba(139, 69, 219, 0.8))
            drop-shadow(0 0 105px rgba(139, 69, 219, 0.6))
            hue-rotate(7deg) 
            saturate(1.55) 
            brightness(1.25);
          transform: scale(1.025);
        }
        25% { 
          filter: 
            drop-shadow(0 0 40px rgba(168, 85, 247, 1)) 
            drop-shadow(0 0 80px rgba(168, 85, 247, 0.8))
            drop-shadow(0 0 120px rgba(168, 85, 247, 0.6))
            hue-rotate(15deg) 
            saturate(1.6) 
            brightness(1.3);
          transform: scale(1.05);
        }
        37.5% { 
          filter: 
            drop-shadow(0 0 45px rgba(180, 108, 249, 1)) 
            drop-shadow(0 0 90px rgba(180, 108, 249, 0.8))
            drop-shadow(0 0 135px rgba(180, 108, 249, 0.6))
            hue-rotate(22deg) 
            saturate(1.65) 
            brightness(1.35);
          transform: scale(1.075);
        }
        50% { 
          filter: 
            drop-shadow(0 0 50px rgba(192, 132, 252, 1)) 
            drop-shadow(0 0 100px rgba(192, 132, 252, 0.8))
            drop-shadow(0 0 150px rgba(192, 132, 252, 0.6))
            hue-rotate(30deg) 
            saturate(1.7) 
            brightness(1.4);
          transform: scale(1.1);
        }
        62.5% { 
          filter: 
            drop-shadow(0 0 45px rgba(196, 181, 253, 1)) 
            drop-shadow(0 0 90px rgba(196, 181, 253, 0.8))
            drop-shadow(0 0 135px rgba(196, 181, 253, 0.6))
            hue-rotate(22deg) 
            saturate(1.65) 
            brightness(1.35);
          transform: scale(1.075);
        }
        75% { 
          filter: 
            drop-shadow(0 0 40px rgba(196, 181, 253, 1)) 
            drop-shadow(0 0 80px rgba(196, 181, 253, 0.8))
            drop-shadow(0 0 120px rgba(196, 181, 253, 0.6))
            hue-rotate(15deg) 
            saturate(1.6) 
            brightness(1.3);
          transform: scale(1.05);
        }
        87.5% { 
          filter: 
            drop-shadow(0 0 35px rgba(139, 69, 219, 1)) 
            drop-shadow(0 0 70px rgba(139, 69, 219, 0.8))
            drop-shadow(0 0 105px rgba(139, 69, 219, 0.6))
            hue-rotate(7deg) 
            saturate(1.55) 
            brightness(1.25);
          transform: scale(1.025);
        }
        100% { 
          filter: 
            drop-shadow(0 0 30px rgba(147, 51, 234, 1)) 
            drop-shadow(0 0 60px rgba(147, 51, 234, 0.8))
            drop-shadow(0 0 90px rgba(147, 51, 234, 0.6))
            hue-rotate(0deg) 
            saturate(1.5) 
            brightness(1.2);
          transform: scale(1);
        }
      }
      
      @keyframes background-rotate {
        0% { transform: rotateZ(0deg) scale(1); opacity: 0.05; }
        100% { transform: rotateZ(360deg) scale(1.1); opacity: 0.08; }
      }
      
      @keyframes background-pulse {
        0%, 100% { transform: scale(1) rotateX(0deg) rotateY(0deg); opacity: 0.03; }
        25% { transform: scale(1.2) rotateX(90deg) rotateY(45deg); opacity: 0.06; }
        50% { transform: scale(1.4) rotateX(180deg) rotateY(90deg); opacity: 0.09; }
        75% { transform: scale(1.2) rotateX(270deg) rotateY(135deg); opacity: 0.06; }
      }
      
      @keyframes background-flow {
        0% { transform: translateX(-50px) translateY(-30px) rotateZ(0deg); opacity: 0.02; }
        33% { transform: translateX(50px) translateY(30px) rotateZ(120deg); opacity: 0.05; }
        66% { transform: translateX(-30px) translateY(50px) rotateZ(240deg); opacity: 0.03; }
        100% { transform: translateX(-50px) translateY(-30px) rotateZ(360deg); opacity: 0.02; }
      }
      
      @keyframes background-wave {
        0% { transform: translateY(0px) rotateX(0deg) scale(1); opacity: 0.03; }
        50% { transform: translateY(-40px) rotateX(180deg) scale(1.3); opacity: 0.06; }
        100% { transform: translateY(0px) rotateX(360deg) scale(1); opacity: 0.03; }
      }
      
      @keyframes background-spiral {
        0% { transform: rotateZ(0deg) translateX(0px) scale(1); opacity: 0.02; }
        25% { transform: rotateZ(90deg) translateX(20px) scale(1.1); opacity: 0.04; }
        50% { transform: rotateZ(180deg) translateX(0px) scale(1.2); opacity: 0.06; }
        75% { transform: rotateZ(270deg) translateX(-20px) scale(1.1); opacity: 0.04; }
        100% { transform: rotateZ(360deg) translateX(0px) scale(1); opacity: 0.02; }
      }
      
      @keyframes wave-ripple {
        0% { transform: translateX(-100%) scaleY(0.5); opacity: 0; }
        25% { transform: translateX(-50%) scaleY(1); opacity: 0.8; }
        50% { transform: translateX(0%) scaleY(1.2); opacity: 1; }
        75% { transform: translateX(50%) scaleY(1); opacity: 0.8; }
        100% { transform: translateX(100%) scaleY(0.5); opacity: 0; }
      }
      
      .logo-gradient-purple {
        animation: logo-gradient-purple 4s ease-in-out infinite;
      }
      
      .background-rotate {
        animation: background-rotate 15s linear infinite;
      }
      
      .background-pulse {
        animation: background-pulse 8s ease-in-out infinite;
      }
      
      .background-flow {
        animation: background-flow 12s ease-in-out infinite;
      }
      
      .background-wave {
        animation: background-wave 10s ease-in-out infinite;
      }
      
      .background-spiral {
        animation: background-spiral 14s ease-in-out infinite;
      }
      
      .wave-move {
        animation: wave-move 6s linear infinite;
      }
      
      .wave-float {
        animation: wave-float 4s ease-in-out infinite;
      }
      
      .horizontal-wave {
        animation: horizontal-wave 4s ease-in-out infinite;
      }
      
      .horizontal-flow {
        animation: horizontal-flow 3s ease-in-out infinite;
      }
      
      .vertical-wave {
        animation: vertical-wave 4s ease-in-out infinite;
      }
      
      .vertical-flow {
        animation: vertical-flow 3s ease-in-out infinite;
      }
      
      .wave-flow {
        animation: wave-flow 3s ease-in-out infinite;
      }
      
      .wave-ripple {
        animation: wave-ripple 4s ease-in-out infinite;
      }
      
      .wavy-flow-delay-1 {
        animation-delay: 1.5s;
      }
      
      .wavy-flow-delay-2 {
        animation-delay: 3s;
      }
      
      .wavy-flow-delay-3 {
        animation-delay: 4.5s;
      }
      
      .wave-ripple-delay-1 {
        animation-delay: 0.5s;
      }
      
      .wave-ripple-delay-2 {
        animation-delay: 1s;
      }
      
      .wave-ripple-delay-3 {
        animation-delay: 1.5s;
      }
      
      .wavy-move-delay-1 {
        animation-delay: 2s;
      }
      
      .wavy-move-delay-2 {
        animation-delay: 4s;
      }
      
      .wavy-move-delay-3 {
        animation-delay: 6s;
      }
      
      .color-shift-delay-1 {
        animation-delay: 1s;
      }
      
      .color-shift-delay-2 {
        animation-delay: 2s;
      }
      
      .color-shift-delay-3 {
        animation-delay: 3s;
      }
      
      .wave-move-delay-1 {
        animation-delay: 1s;
      }
      
      .wave-move-delay-2 {
        animation-delay: 2s;
      }
      
      .wave-move-delay-3 {
        animation-delay: 3s;
      }
      
      .wave-float-delay-1 {
        animation-delay: 0.5s;
      }
      
      .wave-float-delay-2 {
        animation-delay: 1.5s;
      }
      
      .wave-float-delay-3 {
        animation-delay: 2.5s;
      }
      
      .horizontal-wave-delay-1 {
        animation-delay: 0.6s;
      }
      
      .horizontal-wave-delay-2 {
        animation-delay: 1.2s;
      }
      
      .horizontal-wave-delay-3 {
        animation-delay: 1.8s;
      }
      
      .horizontal-flow-delay-1 {
        animation-delay: 0.4s;
      }
      
      .horizontal-flow-delay-2 {
        animation-delay: 0.8s;
      }
      
      .vertical-wave-delay-1 {
        animation-delay: 0.6s;
      }
      
      .vertical-wave-delay-2 {
        animation-delay: 1.2s;
      }
      
      .vertical-wave-delay-3 {
        animation-delay: 1.8s;
      }
      
      .vertical-flow-delay-1 {
        animation-delay: 0.4s;
      }
      
      .vertical-flow-delay-2 {
        animation-delay: 0.8s;
      }
      
      .wave-flow-delay-1 {
        animation-delay: 0.5s;
      }
      
      .wave-flow-delay-2 {
        animation-delay: 1s;
      }
      
      .wave-flow-delay-3 {
        animation-delay: 1.5s;
      }
      
      .wave-flow-delay-4 {
        animation-delay: 2s;
      }
      
      .wave-ripple-delay-1 {
        animation-delay: 0.8s;
      }
      
      .wave-ripple-delay-2 {
        animation-delay: 1.6s;
      }
      
      .wave-ripple-delay-3 {
        animation-delay: 2.4s;
      }
      
      /* Ensure full-screen coverage */
      .sarah-assistant-container {
        height: 100vh !important;
        width: 100vw !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden relative sarah-assistant-container" style={{ height: '100vh', width: '100vw' }}>
      {/* Faded Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center" style={{ perspective: '1000px' }}>
        {/* Faded Animated Background Layers */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Rotating Background Ring - Far */}
          <div className="background-rotate absolute w-[40rem] h-[40rem] rounded-full border border-purple-600/8" style={{ transformStyle: 'preserve-3d' }} />
          
          {/* Pulsing Background Ring - Mid-Far */}
          <div className="background-pulse absolute w-[36rem] h-[36rem] rounded-full border border-purple-500/10" style={{ transformStyle: 'preserve-3d' }} />
          
          {/* Flowing Background Ring - Mid */}
          <div className="background-flow absolute w-[32rem] h-[32rem] rounded-full border border-purple-400/12" style={{ transformStyle: 'preserve-3d' }} />
          
          {/* Waving Background Ring - Close */}
          <div className="background-wave absolute w-[28rem] h-[28rem] rounded-full border border-purple-300/15" style={{ transformStyle: 'preserve-3d' }} />
          
          {/* Spiral Background Ring - Very Close */}
          <div className="background-spiral absolute w-[24rem] h-[24rem] rounded-full border border-purple-200/18" style={{ transformStyle: 'preserve-3d' }} />
          
          {/* Additional Faded Elements */}
          <div className="background-rotate absolute w-[20rem] h-[20rem] rounded-full border-2 border-purple-100/20" style={{ transformStyle: 'preserve-3d', animationDelay: '2s' }} />
          <div className="background-pulse absolute w-[16rem] h-[16rem] rounded-full border border-purple-50/22" style={{ transformStyle: 'preserve-3d', animationDelay: '4s' }} />
          
          {/* Faded Floating Particles */}
          <div className="background-flow absolute w-4 h-4 bg-purple-400/15 rounded-full" style={{ transformStyle: 'preserve-3d', animationDelay: '1s' }} />
          <div className="background-wave absolute w-3 h-3 bg-purple-300/18 rounded-full" style={{ transformStyle: 'preserve-3d', animationDelay: '3s' }} />
          <div className="background-spiral absolute w-2 h-2 bg-purple-200/20 rounded-full" style={{ transformStyle: 'preserve-3d', animationDelay: '5s' }} />
        </div>
      </div>
      
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
      <div className="relative flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        {/* Messages - Mobile Optimized */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 relative z-10" style={{ minHeight: 0 }}>
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
                            onClick={() => {
                              // Always show resource in embedded modal
                              setSelectedResource(resource);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              {getResourceIcon(resource.type)}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-xs truncate">{resource.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                                    Relevance: {Math.min(resource.relevanceScore || 0, 100)}%
                                  </span>
                                  {resource.matchedKeywords && resource.matchedKeywords.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      • {resource.matchedKeywords.slice(0, 2).join(', ')}
                                      {resource.matchedKeywords.length > 2 && '...'}
                                    </span>
                                  )}
                                </div>
                                {resource.note && (
                                  <p className="text-xs text-yellow-400 truncate mt-1">{resource.note}</p>
                                )}
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
          <div className="w-full bg-gray-900 rounded-t-2xl border-t border-gray-800 max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-100">Resource</h3>
                <Badge className="bg-green-600/20 text-green-400 border-green-400/30 text-xs">
                  Embedded View
                </Badge>
              </div>
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
                <div className="bg-gray-800 border border-gray-700 rounded-lg min-h-[300px] flex flex-col">
                  {selectedResource.type === 'video' ? (
                    <div className="flex-1 flex items-center justify-center">
                      {selectedResource.fileUrl ? (
                        <video 
                          controls 
                          className="w-full h-full max-h-[400px] rounded-lg"
                          preload="metadata"
                        >
                          <source src={selectedResource.fileUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="text-center p-8">
                          <Video className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                          <p className="text-gray-400 text-sm mb-2">Video Content</p>
                          <p className="text-gray-500 text-xs">Video not available for preview</p>
                        </div>
                      )}
                    </div>
                  ) : selectedResource.type === 'document' || selectedResource.type === 'guideline' ? (
                    <div className="flex-1 flex items-center justify-center">
                      {selectedResource.fileUrl ? (
                        <iframe 
                          src={selectedResource.fileUrl}
                          className="w-full h-full min-h-[400px] rounded-lg border-0"
                          title={selectedResource.title}
                        />
                      ) : (
                        <div className="text-center p-8">
                          <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                          <p className="text-gray-400 text-sm mb-2">Document Preview</p>
                          <p className="text-gray-500 text-xs">Document not available for preview</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm mb-2">Resource Preview</p>
                      <p className="text-gray-500 text-xs">Preview not available</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl"
                    onClick={() => {
                      if (selectedResource.fileUrl) {
                        // Open the signed URL directly in new tab
                        window.open(selectedResource.fileUrl, '_blank');
                      } else {
                        // Fallback: try to get signed URL
                        fetch(`/api/thumbnail?id=${selectedResource.id}`)
                          .then(response => response.json())
                          .then(data => {
                            if (data.url) {
                              window.open(data.url, '_blank');
                            } else {
                              alert('Resource not available');
                            }
                          })
                          .catch(() => {
                            alert('Unable to open resource');
                          });
                      }
                    }}
                  >
                    Open in New Tab
                  </Button>
                  <Button 
                    variant="outline"
                    className="px-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl"
                    onClick={() => {
                      // Content is already embedded, just scroll to top
                      const modal = document.querySelector('.fixed.inset-0');
                      if (modal) {
                        modal.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    Scroll to Top
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
