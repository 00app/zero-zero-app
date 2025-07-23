import React, { useState, useEffect } from 'react';

interface TypingSequenceProps {
  messages: string[];
  onComplete: () => void;
  typingSpeed?: number;
  messageDelay?: number;
}

export function TypingSequence({ 
  messages, 
  onComplete, 
  typingSpeed = 50, 
  messageDelay = 600 
}: TypingSequenceProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentMessageIndex >= messages.length) {
      setIsComplete(true);
      setShowCursor(false);
      setTimeout(onComplete, messageDelay);
      return;
    }

    const currentMessage = messages[currentMessageIndex];
    
    if (isTyping) {
      if (currentText.length < currentMessage.length) {
        const timer = setTimeout(() => {
          setCurrentText(currentMessage.substring(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
        setShowCursor(false);
        
        const timer = setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
          setCurrentText('');
          setIsTyping(true);
          setShowCursor(true);
        }, messageDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [currentMessageIndex, currentText, isTyping, messages, typingSpeed, messageDelay, onComplete]);

  // Cursor blink effect
  useEffect(() => {
    if (!isTyping || isComplete) return;
    
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorTimer);
  }, [isTyping, isComplete]);

  if (isComplete) {
    return (
      <div className="text-center opacity-0 animate-pulse">
        <h2 className="zz-h2">ready?</h2>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="zz-h2 min-h-[1.2em] flex items-center justify-center">
        <span className="transition-all duration-200 ease-out">
          {currentText}
        </span>
        <span 
          className={`ml-1 transition-opacity duration-200 ${
            showCursor ? 'opacity-80' : 'opacity-0'
          }`}
        >
          |
        </span>
      </h2>
      
      {/* Progress dots */}
      <div className="flex justify-center space-x-2 mt-8">
        {messages.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index <= currentMessageIndex ? 'bg-current opacity-100' : 'bg-current opacity-20'
            } ${index === currentMessageIndex ? 'scale-125' : 'scale-100'}`}
          />
        ))}
      </div>
    </div>
  );
}