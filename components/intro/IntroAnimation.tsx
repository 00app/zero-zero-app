import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = [
  "what", "if", "you", "could", "make", "a", "change?",
  "reset.",
  "reclaim.",
  "reduce.",
  "recycle.",
  "rethink."
];

interface IntroAnimationProps {
  onComplete: () => void;
  isDark?: boolean;
  onThemeToggle?: () => void;
}

export function IntroAnimation({ onComplete, isDark = true, onThemeToggle }: IntroAnimationProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const timeout = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 400); // 400ms per word for comfortable reading
      return () => clearTimeout(timeout);
    } else {
      // RSVP complete, show button with glitch fade-in
      setTimeout(() => {
        setIsComplete(true);
        setShowButton(true);
        setIsGlitching(true); // start glitch on fade-in
        setTimeout(() => setIsGlitching(false), 1500); // glitch ends after 1.5s
      }, 800);
    }
  }, [currentWordIndex]);

  const handleRestart = () => {
    onComplete();
  };

  return (
    <div 
      className="zz-screen" 
      style={{ padding: '0 40px', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
    >
      {/* Theme Toggle - positioned like other screens */}
      {onThemeToggle && (
        <div className="absolute top-6 right-6">
          <button
            onClick={onThemeToggle}
            className="zz-circle-button"
            style={{ 
              width: '40px', 
              height: '40px',
              fontSize: '16px'
            }}
          >
            {isDark ? '☀' : '●'}
          </button>
        </div>
      )}
      <div 
        className="w-full h-full flex flex-col items-center justify-center"
        style={{ maxWidth: '100%', textAlign: 'center' }}
      >
        {/* RSVP Word Display */}
        <AnimatePresence mode="wait">
          {!isComplete && (
            <motion.div
              key="rsvp-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
              style={{
                width: '100%',
                fontSize: 'clamp(2.5rem, 8vw, 6rem)', // responsive big text
                fontWeight: '700',
                lineHeight: 1.1,
                fontFamily: 'Roboto, sans-serif',
                color: 'var(--zz-text)',
                userSelect: 'none',
                minHeight: '10vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 40px',
                boxSizing: 'border-box',
              }}
            >
              <motion.span
                key={currentWordIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                {words[currentWordIndex] || ""}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glitchy Restart Button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              key="restart-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="flex items-center justify-center mt-12"
              style={{ width: 'clamp(8rem, 20vw, 20rem)', height: 'clamp(8rem, 20vw, 20rem)' }}
            >
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.3
                }}
                onClick={handleRestart}
                className="rounded-full border-2 flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'transparent',
                  borderColor: 'var(--zz-border)',
                  color: 'var(--zz-text)',
                  fontWeight: 700,
                  fontFamily: 'Roboto, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  height: '100%',
                  fontSize: 'clamp(1.8rem, 3vw, 3.2rem)',
                  textTransform: 'lowercase',
                  userSelect: 'none',
                  padding: 0,
                  margin: 0
                }}
                whileHover={{ 
                  scale: 1.05,
                  borderColor: 'var(--zz-accent)'
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="restart onboarding"
              >
                <motion.div
                  className="relative"
                  animate={isGlitching ? {
                    x: [0, -1, 1, -1, 0],
                    y: [0, 1, -1, 1, 0]
                  } : { x: 0, y: 0 }}
                  transition={{
                    duration: 0.2,
                    repeat: isGlitching ? Infinity : 0,
                    ease: "linear"
                  }}
                >
                  restart.
                  
                  {/* Glitch Layers */}
                  {isGlitching && (
                    <>
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ 
                          color: 'var(--zz-grey)',
                          clipPath: 'inset(40% 0 50% 0)',
                          fontSize: 'inherit',
                          fontWeight: 700,
                          userSelect: 'none',
                        }}
                        animate={{
                          x: [-2, 2, -2],
                          opacity: [0.8, 0.3, 0.7]
                        }}
                        transition={{
                          duration: 0.15,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        restart.
                      </motion.div>
                      
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ 
                          color: 'var(--zz-grey)',
                          clipPath: 'inset(20% 0 60% 0)',
                          fontSize: 'inherit',
                          fontWeight: 700,
                          userSelect: 'none',
                        }}
                        animate={{
                          x: [2, -2, 2],
                          opacity: [0.6, 0.9, 0.4]
                        }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          delay: 0.1,
                          ease: "linear"
                        }}
                      >
                        restart.
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
