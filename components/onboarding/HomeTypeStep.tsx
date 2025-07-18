import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HomeTypeStepProps {
  onComplete: (homeType: string) => void;
  initialValue?: string;
}

export function HomeTypeStep({ onComplete, initialValue }: HomeTypeStepProps) {
  const [selectedType, setSelectedType] = useState(initialValue || '');
  const [questionText, setQuestionText] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const fullQuestion = "what type of home do you live in?";
  const typingSpeed = 60;

  const homeTypes = [
    'flat',
    'terraced house',
    'semi-detached house',
    'detached house',
    'student accommodation',
    'shared house'
  ];

  useEffect(() => {
    let currentChar = 0;
    const typeInterval = setInterval(() => {
      if (currentChar <= fullQuestion.length) {
        setQuestionText(fullQuestion.slice(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setShowOptions(true), 300);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, []);

  const handleSelect = (type: string) => {
    setSelectedType(type);
    setTimeout(() => {
      onComplete(type);
    }, 500);
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

      {/* Options */}
      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          {homeTypes.map((type, index) => (
            <motion.button
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              onClick={() => handleSelect(type)}
              className="w-full p-6 text-left border-2 bg-transparent transition-all duration-300"
              style={{
                borderColor: selectedType === type ? 'var(--zz-accent)' : 'var(--zz-border)',
                color: 'var(--zz-text)',
                fontSize: 'var(--text-medium)',
                fontWeight: 'var(--font-regular)',
                fontFamily: 'Roboto, sans-serif',
                lineHeight: 1.4,
                borderRadius: '0',
                background: selectedType === type ? 'var(--zz-accent)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedType !== type) {
                  e.currentTarget.style.borderColor = 'var(--zz-accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedType !== type) {
                  e.currentTarget.style.borderColor = 'var(--zz-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span style={{ 
                color: selectedType === type ? 'var(--zz-bg)' : 'var(--zz-text)' 
              }}>
                {type}
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Selected Answer Display */}
      {selectedType && (
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
            {selectedType} ✓
          </div>
        </motion.div>
      )}
    </div>
  );
}