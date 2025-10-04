'use client';
import React, { useState } from 'react';
import VoiceAssistantNew from '@/components/VoiceAssistantNew';

export default function VoiceAssistantPage() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {Array.from({ length: 400 }).map((_, i) => (
              <div
                key={i}
                className="border border-cyan-500/20 animate-pulse"
                style={{
                  animationDelay: `${i * 0.01}s`,
                  animationDuration: `${2 + (i % 3)}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating Particles */}
        {Array.from({ length: 30 }).map((_, i) => {
          // Generate deterministic values based on index to avoid hydration mismatch
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

      {/* Main Content */}
      <div className="relative z-10 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            CCHMC Voice Assistant
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Ask me anything about pediatric surgery procedures and guidelines
          </p>
        </div>

        <button
          onClick={() => setIsAssistantOpen(true)}
          className="group relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border-4 border-cyan-400 shadow-cyan-400/50 shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-white">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
          
          {/* Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-75"></div>
        </button>

        <p className="text-gray-400 mt-6 text-lg">
          Click to start voice interaction
        </p>
      </div>

      {/* Voice Assistant Modal */}
      {isAssistantOpen && (
        <VoiceAssistantNew onClose={() => setIsAssistantOpen(false)} />
      )}
    </div>
  );
}
