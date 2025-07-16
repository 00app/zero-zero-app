
import React, { useState, useEffect } from 'react';

interface RSVPAnimationProps {
  text: string;
  onComplete: () => void;
}

export function RSVPAnimation({ text, onComplete }: RSVPAnimationProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isWordVisible, setIsWordVisible] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Split text into individual words
  const words = text.split(' ');

  useEffect(() => {
    if (currentWordIndex >= words.length) {
      setIsComplete(true);
      setTimeout(onComplete, 500); // Brief pause before showing CTA
      return;
    }

    let fadeInTimer: NodeJS.Timeout;
    let fadeOutTimer: NodeJS.Timeout;
    let nextWordTimer: NodeJS.Timeout;

    // Start sequence for current word
    const startWordSequence = () => {
      // Fade in (150ms)
      setIsWordVisible(true);

      // After fade in + visible time, start fade out
      fadeOutTimer = setTimeout(() => {
        setIsWordVisible(false);
      }, 250); // 150ms fade in + 100ms visible

      // Move to next word after complete cycle
      nextWordTimer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 300); // 150ms + 100ms + 50ms fade out
    };

    // Small delay before starting
    fadeInTimer = setTimeout(startWordSequence, 50);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(nextWordTimer);
    };
  }, [currentWordIndex, words.length, onComplete]);

  if (isComplete) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-6">
      <div className="w-full max-w-[75%] text-center flex items-center justify-center min-h-screen">
        <h1 
          className={`zz-rsvp-word transition-opacity duration-150 ease-out ${
            isWordVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            fontWeight: 300, // Roboto ExtraLight
            textShadow: 'none'
          }}
        >
          {words[currentWordIndex]}
        </h1>
      </div>
    </div>
  );
}
