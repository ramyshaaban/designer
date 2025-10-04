'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Bot, 
  X, 
  Video, 
  FileText, 
  BookOpen 
} from 'lucide-react';

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

interface VoiceAssistantProps {
  onClose: () => void;
}

export default function VoiceAssistantNew({ onClose }: VoiceAssistantProps) {
  // Add CSS animation styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideInFromBottom {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showResources, setShowResources] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    resources?: Resource[];
  }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const speakTextRef = useRef<(text: string) => void>(() => {});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory, currentResponse, showResources]);

  // Initialize speech recognition and audio context
  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognitionInstance = new (window as any).webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceQuery(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    }

    // Initialize Audio Context for futuristic sounds
    if (typeof window !== 'undefined') {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(audioCtx);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (musicRef.current) {
        musicRef.current.pause();
      }
    };
  }, []);

  // Speak initial question on mount
  useEffect(() => {
    const initialQuestion = "What would you like to find in this space?";
    const timer = setTimeout(() => {
      if (!isMuted && speakTextRef.current) {
        speakTextRef.current(initialQuestion);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isMuted]);

  // Generate futuristic background music using Web Audio API
  const generateFuturisticMusic = () => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  };

  // OpenAI TTS function with immediate voice start
  const speakText = async (text: string) => {
    if (isMuted || !text) return;
    
    setIsSpeaking(true);
    
    try {
      // Use OpenAI TTS for natural voice
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = 0.8;
        audio.preload = 'auto';
        
        currentAudioRef.current = audio;
        audio.onended = () => { 
          setIsSpeaking(false); 
          URL.revokeObjectURL(audioUrl); 
          currentAudioRef.current = null; 
        };
        audio.onerror = () => { 
          setIsSpeaking(false); 
          URL.revokeObjectURL(audioUrl); 
          currentAudioRef.current = null; 
          console.error('OpenAI TTS audio playback failed');
          // Fallback to browser TTS
          fallbackSpeakText(text);
        };
        
        await audio.play();
      } else {
        throw new Error('OpenAI TTS failed');
      }
    } catch (error) {
      console.error('OpenAI TTS Error:', error);
      // Fallback to browser TTS
      fallbackSpeakText(text);
    }
  };

  // Natural browser TTS
  const fallbackSpeakText = (text: string) => {
    if (isMuted || !text) return;
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Natural speaking rate
    utterance.pitch = 1.0; // Natural pitch
    utterance.volume = 0.8; // Clear volume
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen') || voice.name.includes('Susan'));
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    // Start speaking immediately
    window.speechSynthesis.speak(utterance);
  };

  // Set up speakTextRef
  useEffect(() => {
    speakTextRef.current = speakText;
  }, []);

  const toggleMute = () => {
    if (musicRef.current) {
      musicRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    if (!isMuted) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
        setIsSpeaking(false);
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  const handleVoiceInteraction = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else if (!isProcessing && !isSpeaking) {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  const handleVoiceQuery = async (query: string) => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setCurrentQuestion(query);
    setCurrentResponse('');
    setResources([]);
    setShowResources(false);
    setFollowUpQuestion('');
    setShowFollowUp(false);

    // Add user message to conversation history
    setConversationHistory(prev => [...prev, {
      type: 'user',
      content: query,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (data.response && data.resources) {
        // Convert API resources to component resources and deduplicate
        const resourceMap = new Map();
        data.resources.forEach((result: any) => {
          if (!resourceMap.has(result.id)) {
            resourceMap.set(result.id, {
              id: result.id,
              title: result.title,
              type: result.type as 'video' | 'document' | 'guideline',
              url: result.fileUrl || `/api/thumbnail?id=${result.id}`,
              fileUrl: result.fileUrl,
              description: `Relevance: ${result.relevanceScore}% - ${result.matchedKeywords?.join(', ') || 'matched'}`,
              note: result.note,
              relevanceScore: result.relevanceScore,
              matchedKeywords: result.matchedKeywords
            });
          }
        });
        const mappedResources: Resource[] = Array.from(resourceMap.values());

        // Update UI state first
        setCurrentResponse(data.response);
        setResources(mappedResources);
        
        // Start speaking after text appears (small delay for better UX)
        setTimeout(() => {
          speakText(data.response);
        }, 200);
        
        // Add assistant response to conversation history
        setConversationHistory(prev => [...prev, {
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          resources: mappedResources
        }]);
        
        // Generate follow-up question
        generateFollowUpQuestion(query, mappedResources);
        
        // Animate resources appearing
        setTimeout(() => {
          setShowResources(true);
        }, 500); // Reduced from 1000ms to 500ms
      }
    } catch (error) {
      console.error('Voice query error:', error);
      const errorMessage = "I'm sorry, I couldn't process your question. Please try again.";
      
      // Update UI state first
      setCurrentResponse(errorMessage);
      
      // Start speaking after text appears (small delay for better UX)
      setTimeout(() => {
        speakText(errorMessage);
      }, 200);
      
      // Add error response to conversation history
      setConversationHistory(prev => [...prev, {
        type: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate follow-up question
  const generateFollowUpQuestion = async (userQuestion: string, resources: Resource[]) => {
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: `Based on the user's question "${userQuestion}" and the resources I provided about ${resources.map(r => r.title).join(', ')}, generate a single, natural follow-up question that would help the user learn more about this topic. The question should be conversational and show genuine interest in helping them. Keep it concise and specific to pediatric surgery.`,
          followUp: true
        }),
      });
      const data = await response.json();
      if (data.response) {
        let followUp = data.response.trim();
        followUp = followUp.replace(/^["']|["']$/g, '');
        followUp = followUp.replace(/^Follow-up question:?\s*/i, '');
        followUp = followUp.replace(/^Question:?\s*/i, '');
        if (!followUp.endsWith('?')) {
          followUp += '?';
        }
        setFollowUpQuestion(followUp);
        setTimeout(() => {
          setShowFollowUp(true);
        }, 3000);
      }
    } catch (error) {
      console.error('Follow-up generation error:', error);
    }
  };

  // Handle follow-up question click
  const handleFollowUpClick = () => {
    if (followUpQuestion) {
      handleVoiceQuery(followUpQuestion);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-red-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'guideline':
        return <BookOpen className="w-4 h-4 text-green-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50 overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div
                key={i}
                className="border border-purple-500/20 animate-pulse"
                style={{
                  animationDelay: `${(i % 12) * 0.1}s`,
                  animationDuration: `${2 + (i % 3)}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating Particles */}
        {Array.from({ length: 30 }).map((_, i) => {
          const seed = i * 0.618033988749895; // Golden ratio for better distribution
          const left = ((seed * 100) % 100);
          const top = (((seed * 1.618033988749895) * 100) % 100);
          const delay = ((seed * 3) % 3);
          const duration = 2 + ((seed * 2) % 2);
          
          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-40 animate-pulse"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`
              }}
            />
          );
        })}
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-gray-700/50 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sarah</h1>
              <p className="text-sm text-gray-300">CCHMC Pediatric Surgery AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/aws-setup', '_blank')}
              className="text-gray-300 hover:bg-gray-800 hover:text-white"
              title="Configure OpenAI TTS"
            >
              <Bot className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className={`text-gray-300 hover:bg-gray-800 hover:text-white ${
                isMuted ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {/* Welcome Message */}
        {conversationHistory.length === 0 && (
          <div className="flex items-center gap-3 mb-6 animate-slideInFromBottom">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 max-w-2xl">
              <p className="text-gray-300">
                Hello! I'm Sarah, your CCHMC Pediatric Surgery AI Assistant. I can help you find information about procedures, guidelines, and protocols. What would you like to know?
              </p>
            </div>
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-2xl ${message.type === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-lg p-4 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white ml-auto' 
                  : 'bg-gray-800/50 border border-gray-600 text-gray-300'
              }`}>
                <p className="leading-relaxed">{message.content}</p>
              </div>
              
              {/* Resources for assistant messages */}
              {message.type === 'assistant' && message.resources && message.resources.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-gray-300">Resources</span>
                    <Badge className="bg-green-600/20 text-green-400 border-green-400/30 text-xs">
                      {message.resources.length}
                    </Badge>
                  </div>
                  
                         <div className="grid gap-2">
                           {message.resources.map((resource, resourceIndex) => (
                             <div
                               key={`${message.timestamp.getTime()}-${resource.id}-${resourceIndex}`}
                               className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 hover:bg-gray-600/50 transition-colors cursor-pointer group"
                               style={{
                                 animationDelay: `${resourceIndex * 0.1}s`,
                                 animation: 'fadeInUp 0.6s ease-out forwards',
                                 opacity: 0,
                                 transform: 'translateY(20px)'
                               }}
                               onClick={() => setSelectedResource(resource)}
                             >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-1">
                            {getResourceIcon(resource.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-1 text-sm">
                              {resource.title}
                            </h5>
                            <div className="flex items-center gap-1 flex-wrap">
                              <Badge className="bg-blue-600/20 text-blue-400 border-blue-400/30 text-xs">
                                {resource.type}
                              </Badge>
                              {resource.relevanceScore && (
                                <span className="text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded-full border border-cyan-400/20">
                                  {Math.min(resource.relevanceScore || 0, 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Current Response (if any) */}
        {currentResponse && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="max-w-2xl">
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-gray-300">
                <p className="leading-relaxed">{currentResponse}</p>
              </div>
            </div>
          </div>
        )}

        {/* Follow-up Question */}
        {showFollowUp && followUpQuestion && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="max-w-2xl">
              <Button
                onClick={handleFollowUpClick}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border border-purple-500 px-4 py-3 rounded-lg relative overflow-hidden group hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-purple-700 animate-pulse"></div>
                </div>
                <div className="relative z-10 text-left">
                  <p className="text-sm font-medium">{followUpQuestion}</p>
                  <p className="text-xs text-purple-200 mt-1">Click to ask Sarah</p>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Bottom Assistant Button */}
      <div className="relative z-10 p-4 border-t border-gray-700/50 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Pulsing Ring */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></div>
            )}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75"></div>
            )}
            
            {/* Main Button */}
            <button
              onClick={handleVoiceInteraction}
              disabled={isProcessing}
              className={`w-16 h-16 rounded-full border-4 transition-all duration-300 ${
                isListening 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 border-red-400 shadow-red-400/50 shadow-2xl animate-pulse' 
                  : isProcessing
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 shadow-yellow-400/50 shadow-2xl'
                  : isSpeaking
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-green-400/50 shadow-2xl animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-400 shadow-cyan-400/50 shadow-2xl hover:scale-105'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : isListening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : isSpeaking ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
        
        {/* Status Text */}
        <div className="text-center mt-2">
          <p className="text-gray-300 text-sm">
            {isListening 
              ? "Listening... Speak now" 
              : isProcessing 
              ? "Processing your question..." 
              : isSpeaking
              ? "Sarah is speaking..."
              : "Tap to ask Sarah"
            }
          </p>
        </div>
      </div>

      {/* Resource Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-gray-900 border-gray-700 max-w-4xl w-full max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getResourceIcon(selectedResource.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedResource.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-400/30">
                        {selectedResource.type}
                      </Badge>
                      <Badge className="bg-green-600/20 text-green-400 border-green-400/30 text-xs">
                        Embedded View
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedResource(null)}
                  className="text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedResource.type === 'video' && selectedResource.fileUrl ? (
                <video
                  src={selectedResource.fileUrl}
                  controls
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
              ) : selectedResource.type === 'document' || selectedResource.type === 'guideline' ? (
                <iframe
                  src={selectedResource.fileUrl || selectedResource.url}
                  className="w-full h-96 rounded-lg border border-gray-600"
                  title={selectedResource.title}
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">Preview not available for this resource type</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <Button 
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl"
                onClick={() => {
                  if (selectedResource.fileUrl) {
                    window.open(selectedResource.fileUrl, '_blank');
                  } else {
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
                  const modal = document.querySelector('.fixed.inset-0');
                  if (modal) {
                    modal.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                Scroll to Top
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
