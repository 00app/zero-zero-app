import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlitchIntro } from '../GlitchIntro';
import { RSVPAnimation } from '../RSVPAnimation';
import { WordByWordAnimation } from '../WordByWordAnimation';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Animation sequence steps
  const steps = [
    { component: 'manifesto', duration: 4000 },
    { component: 'glitch', duration: 3000 },
    { component: 'rsvp', duration: 2500 },
    { component: 'cta', duration: 0 }
  ];

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps]);

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="zz-screen" style={{ 
      background: 'var(--zz-bg)', 
      color: 'var(--zz-text)',
      fontFamily: 'Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Manifesto Animation */}
      {currentStep === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full flex items-center justify-center"
        >
          <WordByWordAnimation
            text="save money reduce carbon improve wellbeing"
            onComplete={() => {}}
          />
        </motion.div>
      )}

      {/* Glitch Animation */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full flex items-center justify-center"
        >
          <GlitchIntro onComplete={() => {}} />
        </motion.div>
      )}

      {/* RSVP Animation */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full flex items-center justify-center"
        >
          <RSVPAnimation 
            text="zero zero"
            onComplete={() => {}}
          />
        </motion.div>
      )}

      {/* CTA Button */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full flex flex-col items-center justify-center gap-8"
        >
          <div className="text-center mb-8">
            <div className="zz-large mb-4" style={{ lineHeight: 1.2 }}>
              welcome to zero zero
            </div>
            <div className="zz-medium opacity-70" style={{ lineHeight: 1.4 }}>
              the sustainability app that helps you save money,<br />
              reduce your carbon footprint, and improve wellbeing
            </div>
          </div>
          
          <motion.button
            onClick={handleComplete}
            className="zz-cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              background: 'var(--zz-accent)',
              color: 'var(--zz-bg)',
              border: 'none',
              borderRadius: '50%',
              padding: 'var(--spacing-md)',
              width: '120px',
              height: '120px',
              fontSize: 'var(--text-medium)',
              fontWeight: 'var(--font-regular)',
              cursor: 'pointer',
              transition: 'all var(--duration-normal) var(--ease-out)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              lineHeight: 1.2
            }}
          >
            start
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}