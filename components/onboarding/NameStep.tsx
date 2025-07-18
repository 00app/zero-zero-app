import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlitchText } from '../effects/GlitchText';
import { useGlitchAnimation } from '../hooks/useGlitchAnimation';

interface NameStepProps {
  onComplete: (name: string) => void;
  initialValue?: string;
}

export function NameStep({ onComplete, initialValue }: NameStepProps) {
  const [name, setName] = useState(initialValue || '');
  const [questionText, setQuestionText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const isGlitching = useGlitchAnimation(1500);

  const fullQuestion = "what's your name?";
  const typingSpeed = 60;

  useEffect(() => {
    let currentChar = 0;
    const typeInterval = setInterval(() => {
      if (currentChar <= fullQuestion.length) {
        setQuestionText(fullQuestion.slice(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setShowInput(true), 300);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    if (name.trim() && showInput) {
      setShowContinue(true);
    } else {
      setShowContinue(false);
    }
  }, [name, showInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div className="space-y-8">
      {/* Question */}
      <div className="text-left">
        <div 
          className="zz-large mb-8"
          style={{ 
            fontWeight: 'var(--font-regular)',
            lineHeight: 1.2,
            minHeight: '29px',
            textAlign: 'left'
          }}
        >
          {questionText}
          {questionText.length < fullQuestion.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1 h-6 ml-1"
              style={{ background: 'var(--zz-text)' }}
            />
          )}
        </div>
      </div>

      {/* Input Field */}
      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="enter your name"
                className="w-full py-6 pr-6 pl-0 text-left bg-transparent"
                style={{
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  color: 'var(--zz-text)',
                  fontSize: 'var(--text-large)',
                  fontWeight: 'var(--font-regular)',
                  fontFamily: 'Roboto, sans-serif',
                  lineHeight: 1.2
                }}
                autoFocus
              />
            </div>

            {/* Typed Answer Display */}
            {name && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-left"
              >
                <div 
                  className="zz-medium opacity-70"
                  style={{ lineHeight: 1.4 }}
                >
                  hello, {name}
                </div>
              </motion.div>
            )}

            {/* Continue Button */}
            {showContinue && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex justify-start"
              >
                <button
                  type="submit"
                  className="px-8 py-4 border-2 bg-transparent transition-all duration-300"
                  style={{
                    borderColor: 'var(--zz-accent)',
                    color: 'var(--zz-text)',
                    fontSize: 'var(--text-medium)',
                    fontWeight: 'var(--font-regular)',
                    fontFamily: 'Roboto, sans-serif',
                    borderRadius: '0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--zz-accent)';
                    e.currentTarget.style.color = 'var(--zz-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--zz-text)';
                  }}
                  aria-label="Continue to next step"
                >
                  <GlitchText isGlitching={isGlitching}>
                    continue →
                  </GlitchText>
                </button>
              </motion.div>
            )}
          </form>
        </motion.div>
      )}
    </div>
  );
}