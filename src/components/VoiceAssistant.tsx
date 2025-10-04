'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Bot, X, Play, Pause, Volume2, VolumeX, Video, FileText, BookOpen, Loader2 } from 'lucide-react';

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

export default function VoiceAssistant({ onClose }: VoiceAssistantProps) {
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
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentQuestion(transcript);
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

    // Create background music
    const music = new Audio();
    music.loop = true;
    music.volume = 0.3;
    setBackgroundMusic(music);
    musicRef.current = music;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (musicRef.current) {
        musicRef.current.pause();
      }
    };
  }, []);

  // Speak initial question when component mounts
  useEffect(() => {
    const initialQuestion = "What would you like to find in this space?";
    
    // Small delay to ensure everything is loaded
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
    const filter = audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);

    // Create ambient pad sound
    setTimeout(() => {
      const padOscillator = audioContext.createOscillator();
      const padGain = audioContext.createGain();
      const padFilter = audioContext.createBiquadFilter();

      padOscillator.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(audioContext.destination);

      padOscillator.type = 'sawtooth';
      padOscillator.frequency.setValueAtTime(110, audioContext.currentTime);
      
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(400, audioContext.currentTime);

      padGain.gain.setValueAtTime(0, audioContext.currentTime);
      padGain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 1);
      padGain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 4);
      padGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 5);

      padOscillator.start(audioContext.currentTime);
      padOscillator.stop(audioContext.currentTime + 5);
    }, 1000);
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      musicRef.current?.pause();
      setIsMusicPlaying(false);
    } else {
      generateFuturisticMusic();
      setIsMusicPlaying(true);
    }
  };

  // AI-powered Text-to-Speech function using OpenAI TTS
  const speakText = async (text: string) => {
    if (isMuted || !text) return;
    
    try {
      setIsSpeaking(true);
      
      // Call our TTS API endpoint
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('TTS API failed');
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element and play
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;
      currentAudioRef.current = audio; // Store reference for muting
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl); // Clean up
        currentAudioRef.current = null;
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl); // Clean up
        currentAudioRef.current = null;
        console.error('Audio playback failed');
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
      
      // Fallback to browser TTS if OpenAI TTS fails
      fallbackSpeakText(text);
    }
  };

  // Fallback to browser TTS if AI TTS fails
  const fallbackSpeakText = (text: string) => {
    if (isMuted || !text) return;
    
    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 0.8; // Good volume level
    
    // Try to use a female voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Karen') ||
      voice.name.includes('Susan')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  // Generate follow-up question based on user's question and resources
  const generateFollowUpQuestion = async (userQuestion: string, resources: Resource[]) => {
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: `Based on the user's question "${userQuestion}" and the resources I provided about ${resources.map(r => r.title).join(', ')}, generate a single, natural follow-up question that would help the user learn more about this topic. The question should be conversational and show genuine interest in helping them. Keep it concise and specific to pediatric surgery.`,
          followUp: true
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        // Clean up the response to extract just the question
        let followUp = data.response.trim();
        
        // Remove any quotes or extra text
        followUp = followUp.replace(/^["']|["']$/g, '');
        followUp = followUp.replace(/^Follow-up question:?\s*/i, '');
        followUp = followUp.replace(/^Question:?\s*/i, '');
        
        // Ensure it ends with a question mark
        if (!followUp.endsWith('?')) {
          followUp += '?';
        }
        
        setFollowUpQuestion(followUp);
        
        // Show follow-up after a delay
        setTimeout(() => {
          setShowFollowUp(true);
        }, 3000);
      }
    } catch (error) {
      console.error('Follow-up generation error:', error);
    }
  };

  // Update the ref whenever speakText changes
  useEffect(() => {
    speakTextRef.current = speakText;
  }, [isMuted]);

  const toggleMute = () => {
    if (musicRef.current) {
      musicRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    
    // Also stop speech when muting
    if (!isMuted) {
      // Stop AI TTS audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
        setIsSpeaking(false);
      }
      
      // Stop browser TTS
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
        setCurrentResponse(data.response);
        
        // Convert API resources to component resources
        const mappedResources: Resource[] = data.resources.map((result: any) => ({
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

        setResources(mappedResources);
        
        // Add assistant response to conversation history
        setConversationHistory(prev => [...prev, {
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          resources: mappedResources
        }]);
        
        // Speak the response
        speakText(data.response);
        
        // Generate follow-up question
        generateFollowUpQuestion(query, mappedResources);
        
        // Animate resources appearing
        setTimeout(() => {
          setShowResources(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Voice query error:', error);
      const errorMessage = "I'm sorry, I couldn't process your question. Please try again.";
      setCurrentResponse(errorMessage);
      
      // Add error response to conversation history
      setConversationHistory(prev => [...prev, {
        type: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }]);
      
      speakText(errorMessage);
    } finally {
      setIsProcessing(false);
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
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {Array.from({ length: 400 }).map((_, i) => (
              <div
                key={i}
                className="border border-cyan-500/10 animate-pulse"
                style={{
                  animationDelay: `${i * 0.01}s`,
                  animationDuration: `${2 + (i % 3)}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating Particles */}
        {Array.from({ length: 50 }).map((_, i) => {
          // Generate deterministic values based on index to avoid hydration mismatch
          const seed = i * 0.618033988749895; // Golden ratio for better distribution
          const left = ((seed * 100) % 100);
          const top = (((seed * 1.618033988749895) * 100) % 100);
          const delay = ((seed * 3) % 3);
          const duration = 2 + ((seed * 2) % 2);
          
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-pulse"
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full p-4">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMusic}
              className="text-cyan-400 hover:bg-cyan-400/20 border border-cyan-400/30"
            >
              {isMusicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-cyan-400 hover:bg-cyan-400/20 border border-cyan-400/30"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Central Assistant Button */}
        <div className="flex flex-col items-center space-y-8">
          {/* Main Assistant Button */}
          <div className="relative">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              className={`w-32 h-32 rounded-full border-4 transition-all duration-300 ${
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
                <Loader2 className="w-12 h-12 animate-spin text-white" />
              ) : isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : isSpeaking ? (
                <Volume2 className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </Button>

            {/* Pulsing Ring */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></div>
            )}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75"></div>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Voice Assistant
            </h1>
            <p className="text-gray-300 text-lg">
              {isListening 
                ? "Listening... Speak now" 
                : isProcessing 
                ? "Processing your question..." 
                : isSpeaking
                ? "Sarah is speaking..."
                : "What would you like to find in this space?"
              }
            </p>
            {currentQuestion && (
              <p className="text-cyan-400 text-sm mt-2 italic">
                "You asked: {currentQuestion}"
              </p>
            )}
          </div>
        </div>

        {/* Response Side Panel */}
        {(currentResponse || showResources) && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-96 max-h-[80vh] overflow-hidden">
            <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700 h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">Sarah's Response</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentResponse('');
                    setShowResources(false);
                    setFollowUpQuestion('');
                    setShowFollowUp(false);
                  }}
                  className="text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* AI Response */}
                {currentResponse && (
                  <div>
                    <p className="text-gray-300 leading-relaxed text-sm">{currentResponse}</p>
                  </div>
                )}

                {/* Resources */}
                {showResources && resources.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-green-400" />
                      <h4 className="font-medium text-white">Resources</h4>
                      <Badge className="bg-green-600/20 text-green-400 border-green-400/30 text-xs">
                        {resources.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {resources.map((resource, index) => (
                        <div
                          key={resource.id}
                          className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer group"
                          style={{
                            animationDelay: `${index * 0.1}s`,
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

                {/* Follow-up Question */}
                {showFollowUp && followUpQuestion && (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <h4 className="font-medium text-white">Follow-up</h4>
                    </div>
                    <Button
                      onClick={handleFollowUpClick}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border border-purple-500 px-3 py-2 rounded-lg relative overflow-hidden group hover:scale-105 transition-all duration-300"
                    >
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-purple-700 animate-pulse"></div>
                      </div>
                      <div className="relative z-10 text-left">
                        <p className="text-xs font-medium">{followUpQuestion}</p>
                        <p className="text-xs text-purple-200 mt-0.5">Click to ask</p>
                      </div>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Resource Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getResourceIcon(selectedResource.type)}
                <h3 className="font-semibold text-white">{selectedResource.title}</h3>
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
            
            <div className="p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-700 text-gray-200 border-gray-600">
                    {selectedResource.type}
                  </Badge>
                  <Badge className="bg-cyan-600/20 text-cyan-400 border-cyan-400/30">
                    {selectedResource.relevanceScore}% relevance
                  </Badge>
                </div>
                
                {selectedResource.description && (
                  <p className="text-gray-300 text-sm">{selectedResource.description}</p>
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
                        window.open(selectedResource.fileUrl, '_blank');
                      }
                    }}
                  >
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
