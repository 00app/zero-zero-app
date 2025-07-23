import React, { useState, useEffect } from 'react';

interface WordByWordAnimationProps {
  text: string;
  onComplete: () => void;
  wordDelay?: number;
  holdDelay?: number;
}

export function WordByWordAnimation({ 
  text, 
  onComplete, 
  wordDelay = 150,
  holdDelay = 1200
}: WordByWordAnimationProps) {
  const [visibleWords, setVisibleWords] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);

  const words = text.split(' ');

  useEffect(() => {
    if (visibleWords < words.length) {
      const timer = setTimeout(() => {
        setVisibleWords(prev => prev + 1);
      }, wordDelay);
      return () => clearTimeout(timer);
    } else if (!isComplete) {
      // Hold the complete message briefly before completing
      const timer = setTimeout(() => {
        setIsComplete(true);
        setTimeout(onComplete, 800);
      }, holdDelay);
      return () => clearTimeout(timer);
    }
  }, [visibleWords, words.length, wordDelay, holdDelay, onComplete, isComplete]);

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        {words.map((word, index) => (
          <div
            key={index}
            className={`transition-all duration-300 ease-out ${
              index < visibleWords 
                ? 'opacity-100 transform translate-y-0 scale-100' 
                : 'opacity-0 transform translate-y-8 scale-95'
            }`}
          >
            <h1 className="zz-manifesto-word">
              {word}
            </h1>
          </div>
        ))}
      </div>
      
      {isComplete && (
        <div className="opacity-0 animate-pulse">
          <div className="w-12 h-1 bg-current mx-auto" />
        </div>
      )}
    </div>
  );
}