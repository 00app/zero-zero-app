
import { useState, useEffect, useRef } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  showCursor?: boolean;
  onComplete?: () => void;
  className?: string;
  loop?: boolean;
  startTyping?: boolean;
}

export function TypingText({
  text,
  speed = 100,
  delay = 0,
  showCursor = true,
  onComplete,
  className = '',
  loop = false,
  startTyping = true
}: TypingTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingCursor, setShowTypingCursor] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!startTyping) {
      setDisplayText('');
      setIsTyping(false);
      setShowTypingCursor(false);
      return;
    }

    const startTypingAnimation = () => {
      setDisplayText('');
      setIsTyping(true);
      setShowTypingCursor(true);
      
      let currentIndex = 0;
      
      intervalRef.current = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          // Typing complete
          setIsTyping(false);
          clearInterval(intervalRef.current);
          
          // Hide cursor after a delay
          setTimeout(() => {
            setShowTypingCursor(false);
          }, 1000);
          
          onComplete?.();
          
          // Loop if requested
          if (loop) {
            setTimeout(() => {
              startTypingAnimation();
            }, 2000);
          }
        }
      }, speed);
    };

    // Start after delay
    timeoutRef.current = setTimeout(startTypingAnimation, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, delay, onComplete, loop, startTyping]);

  return (
    <span className={`inline-block ${className}`}>
      <span className="inline-block">
        {displayText}
      </span>
      {showCursor && showTypingCursor && (
        <span className="typing-cursor" />
      )}
    </span>
  );
}

interface TypingButtonProps {
  children: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  speed?: number;
  delay?: number;
  startTyping?: boolean;
}

export function TypingButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  speed = 80,
  delay = 300,
  startTyping = true
}: TypingButtonProps) {
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [canClick, setCanClick] = useState(false);

  useEffect(() => {
    if (startTyping) {
      setIsTypingComplete(false);
      setCanClick(false);
    }
  }, [startTyping]);

  const handleTypingComplete = () => {
    setIsTypingComplete(true);
    setTimeout(() => {
      setCanClick(true);
    }, 200);
  };

  const handleClick = () => {
    if (canClick && !disabled) {
      onClick?.();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || !canClick}
      className={`zz-button ${!canClick ? 'zz-button-typing' : ''} ${className}`}
    >
      <TypingText
        text={children}
        speed={speed}
        delay={delay}
        showCursor={!isTypingComplete}
        onComplete={handleTypingComplete}
        startTyping={startTyping}
      />
    </button>
  );
}
