import { useState, useEffect } from 'react';

interface RSVPAnimationProps {
  text: string;
  onComplete: () => void;
}

export function RSVPAnimation({ text, onComplete }: RSVPAnimationProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const words = text.toLowerCase().split(' ');

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(currentWordIndex + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(() => {
        setIsComplete(true);
        setTimeout(onComplete, 1000);
      }, 1000);
      return () => clearTimeout(finalTimer);
    }
  }, [currentWordIndex, words.length, onComplete]);

  if (isComplete) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-8">
      <div className="text-center max-w-4xl">
        {currentWordIndex < words.length && (
          <div className="zz-rsvp-word animate-pulse">
            {words[currentWordIndex]}
          </div>
        )}
      </div>
    </div>
  );
}