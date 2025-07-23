import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
  isDark?: boolean;
  onThemeToggle?: () => void;
}

export function IntroAnimation({ onComplete, isDark = true, onThemeToggle }: IntroAnimationProps) {
  const [stage, setStage] = useState<'rsvp' | 'manifesto' | 'glitch'>('rsvp');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // RSVP words for dramatic reveal
  const rsvpWords = [
    'welcome',
    'to',
    'zero',
    'zero'
  ];

  // Manifesto text
  const manifestoWords = [
    'save',
    'money',
    'reduce',
    'carbon',
    'improve',
    'wellbeing'
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // RSVP Animation - 500ms per word
    rsvpWords.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setCurrentWordIndex(index);
        }, index * 500)
      );
    });

    // Transition to manifesto after RSVP
    timers.push(
      setTimeout(() => {
        setStage('manifesto');
        setCurrentWordIndex(0);
      }, rsvpWords.length * 500 + 1000)
    );

    // Manifesto words - 600ms each
    manifestoWords.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setCurrentWordIndex(index);
        }, (rsvpWords.length * 500 + 1500) + (index * 600))
      );
    });

    // Glitch effect
    timers.push(
      setTimeout(() => {
        setStage('glitch');
      }, (rsvpWords.length * 500 + 1500) + (manifestoWords.length * 600) + 1000)
    );

    // Transition directly to onboarding after glitch
    timers.push(
      setTimeout(() => {
        onComplete();
      }, (rsvpWords.length * 500 + 1500) + (manifestoWords.length * 600) + 3000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [onComplete]);

  return (
    <div 
      className="zz-screen"
      style={{ 
        background: 'var(--zz-bg)', 
        color: 'var(--zz-text)',
        fontFamily: 'Roboto, sans-serif',
        position: 'relative',
        padding: 'var(--spacing-md)'
      }}
    >
      {/* Theme toggle */}
      {onThemeToggle && (
        <div 
          style={{ 
            position: 'absolute',
            top: 'var(--spacing-md)',
            right: 'var(--spacing-md)'
          }}
        >
          <button
            onClick={onThemeToggle}
            className="zz-circle-button"
            style={{ 
              width: '40px', 
              height: '40px',
              fontSize: 'var(--text-medium)',
              background: 'transparent',
              color: 'var(--zz-text)',
              border: '2px solid var(--zz-border)',
              cursor: 'pointer',
              transition: 'all var(--duration-normal) var(--ease-out)'
            }}
          >
            {isDark ? '☀' : '●'}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* RSVP Stage */}
        {stage === 'rsvp' && (
          <motion.div
            key="rsvp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              textAlign: 'center',
              width: '100%'
            }}
          >
            <div className="zz-rsvp-word">
              {rsvpWords[currentWordIndex]}
            </div>
          </motion.div>
        )}

        {/* Manifesto Stage */}
        {stage === 'manifesto' && (
          <motion.div
            key="manifesto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              textAlign: 'center',
              width: '100%'
            }}
          >
            <div className="zz-manifesto-word">
              {manifestoWords[currentWordIndex]}
            </div>
          </motion.div>
        )}

        {/* Glitch Stage */}
        {stage === 'glitch' && (
          <motion.div
            key="glitch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              textAlign: 'center',
              width: '100%'
            }}
          >
            <div className="zz-glitch-container">
              <div className="zz-glitch-text">
                zero
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}