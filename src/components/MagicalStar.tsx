"use client"

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface MagicalStarProps {
  targetId: string;
  duration?: number;
  size?: number;
  color?: string;
  onComplete?: () => void;
}

const MagicalStar: React.FC<MagicalStarProps> = ({
  targetId,
  duration = 3000,
  size = 24,
  color = '#8B5CF6',
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    // Get element position and dimensions
    const rect = targetElement.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    setPosition({
      x: rect.left + scrollX,
      y: rect.top + scrollY,
      width: rect.width,
      height: rect.height
    });

    // Show the star
    setIsVisible(true);

    // Hide after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [targetId, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: position.width + size,
        height: position.height + size,
      }}
    >
      {/* Magical star animation */}
      <div
        className="absolute animate-spin"
        style={{
          width: position.width + size,
          height: position.height + size,
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
        }}
      >
        {/* Top star */}
        <Star
          className="absolute"
          style={{
            left: '50%',
            top: 0,
            transform: 'translateX(-50%)',
            color: color,
            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
          }}
          size={size}
        />
        
        {/* Right star */}
        <Star
          className="absolute"
          style={{
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            color: color,
            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
          }}
          size={size}
        />
        
        {/* Bottom star */}
        <Star
          className="absolute"
          style={{
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            color: color,
            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
          }}
          size={size}
        />
        
        {/* Left star */}
        <Star
          className="absolute"
          style={{
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            color: color,
            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
          }}
          size={size}
        />
      </div>

      {/* Magical sparkle effects */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${20 + (i * 10)}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>

      {/* Glowing border effect */}
      <div
        className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-pulse"
        style={{
          animationDuration: '1.5s',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
        }}
      />
    </div>
  );
};

export default MagicalStar;


