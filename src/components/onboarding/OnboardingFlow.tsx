import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface OnboardingData {
  name: string;
  postcode: string;
  homeType: 'flat' | 'house' | 'shared' | 'student';
  people: number;
  rooms: number;
  transportMode: 'walk' | 'bike' | 'bus' | 'train' | 'car' | 'mixed';
  spendAmount: number;
  goals: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  isDark?: boolean;
  onThemeToggle?: () => void;
}

interface Step {
  id: string;
  question: string;
  type: 'text' | 'select' | 'number' | 'multiselect';
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

const steps: Step[] = [
  {
    id: 'name',
    question: 'what\'s your name?',
    type: 'text',
    placeholder: 'alex'
  },
  {
    id: 'postcode',
    question: 'where do you live?',
    type: 'text',
    placeholder: 'sw1a 1aa'
  },
  {
    id: 'homeType',
    question: 'what type of home?',
    type: 'select',
    options: ['flat', 'house', 'shared', 'student']
  },
  {
    id: 'people',
    question: 'how many people live there?',
    type: 'number',
    min: 1,
    max: 10
  },
  {
    id: 'rooms',
    question: 'how many bedrooms?',
    type: 'number',
    min: 1,
    max: 8
  },
  {
    id: 'transportMode',
    question: 'how do you get around?',
    type: 'select',
    options: ['walk', 'bike', 'bus', 'train', 'car', 'mixed']
  },
  {
    id: 'spendAmount',
    question: 'weekly household budget?',
    type: 'number',
    min: 20,
    max: 500,
    placeholder: '£75'
  }
];

export function OnboardingFlow({ onComplete, isDark = true, onThemeToggle }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({});
  const [inputValue, setInputValue] = useState<string | number>('');

  const step = steps[currentStep];

  const handleAnswer = (value: string | number | string[]) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);

    // Auto-advance for single selects
    if (step.type === 'select') {
      setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
          setInputValue('');
        } else {
          completeOnboarding(newAnswers);
        }
      }, 500);
    }
  };

  const handleNext = () => {
    if (inputValue !== '' && inputValue !== 0) {
      handleAnswer(inputValue);
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setInputValue('');
      } else {
        completeOnboarding({ ...answers, [step.id]: inputValue });
      }
    }
  };

  const completeOnboarding = async (finalAnswers: Partial<OnboardingData>) => {
    const userData: OnboardingData = {
      name: (finalAnswers.name as string) || 'alex',
      postcode: (finalAnswers.postcode as string) || 'sw1a 1aa',
      homeType: (finalAnswers.homeType as OnboardingData['homeType']) || 'flat',
      people: (finalAnswers.people as number) || 2,
      rooms: (finalAnswers.rooms as number) || 2,
      transportMode: (finalAnswers.transportMode as OnboardingData['transportMode']) || 'mixed',
      spendAmount: (finalAnswers.spendAmount as number) || 75,
      goals: ['save money', 'reduce carbon', 'improve wellbeing']
    };

    // Save to Supabase if available
    try {
      const { createUserProfile } = await import('../../../services/supabase');
      console.log('💾 Saving user profile:', userData);
      await createUserProfile(userData);
      console.log('✅ User profile saved successfully');
    } catch (error) {
      console.log('📱 Running in mock mode, user data not persisted:', error);
    }

    onComplete(userData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step.type !== 'select') {
      handleNext();
    }
  };

  const renderInput = () => {
    switch (step.type) {
      case 'text':
        return (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={step.placeholder}
            autoFocus
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '3px solid var(--zz-border)',
              color: 'var(--zz-text)',
              fontSize: 'var(--text-large)',
              fontWeight: 'var(--font-medium)',
              padding: 'var(--spacing-sm) 0',
              outline: 'none',
              textAlign: 'center',
              width: '100%',
              maxWidth: '400px',
              textTransform: 'lowercase',
              fontFamily: 'Roboto, sans-serif'
            }}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            min={step.min}
            max={step.max}
            placeholder={step.placeholder}
            autoFocus
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '3px solid var(--zz-border)',
              color: 'var(--zz-text)',
              fontSize: 'var(--text-large)',
              fontWeight: 'var(--font-medium)',
              padding: 'var(--spacing-sm) 0',
              outline: 'none',
              textAlign: 'center',
              width: '100%',
              maxWidth: '400px',
              textTransform: 'lowercase',
              fontFamily: 'Roboto, sans-serif'
            }}
          />
        );

      case 'select':
        return (
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--spacing-md)',
              width: '100%',
              maxWidth: '500px'
            }}
          >
            {step.options?.map((option) => (
              <motion.button
                key={option}
                onClick={() => handleAnswer(option)}
                className="zz-question-option"
                style={{
                  background: 'transparent',
                  color: 'var(--zz-text)',
                  border: '3px solid var(--zz-border)',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--text-large)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-normal) var(--ease-out)',
                  textAlign: 'center',
                  textTransform: 'lowercase',
                  fontFamily: 'Roboto, sans-serif',
                  width: '100%'
                }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: 'var(--zz-accent)',
                  color: 'var(--zz-bg)',
                  borderColor: 'var(--zz-accent)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="zz-screen"
      style={{ 
        background: 'var(--zz-bg)', 
        color: 'var(--zz-text)',
        fontFamily: 'Roboto, sans-serif',
        position: 'relative',
        padding: 'var(--spacing-md)',
        gap: 'var(--spacing-xl)'
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

      {/* Progress indicator */}
      <div 
        style={{ 
          position: 'absolute',
          top: 'var(--spacing-md)',
          left: 'var(--spacing-md)',
          fontSize: 'var(--text-small)',
          opacity: 0.6,
          textTransform: 'lowercase'
        }}
      >
        {currentStep + 1}/{steps.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-xl)',
            width: '100%',
            textAlign: 'center'
          }}
        >
          {/* Question */}
          <div 
            className="zz-rsvp-word"
            style={{
              fontSize: 'var(--text-rsvp)',
              fontWeight: 'var(--font-medium)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              margin: 0,
              textTransform: 'lowercase',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            {step.question}
          </div>

          {/* Input */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {renderInput()}
          </div>

          {/* Next button for text/number inputs */}
          {(step.type === 'text' || step.type === 'number') && (
            <motion.button
              onClick={handleNext}
              disabled={!inputValue || inputValue === 0}
              style={{
                background: inputValue ? 'var(--zz-accent)' : 'transparent',
                color: inputValue ? 'var(--zz-bg)' : 'var(--zz-text)',
                border: '3px solid var(--zz-border)',
                borderColor: inputValue ? 'var(--zz-accent)' : 'var(--zz-border)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                fontSize: 'var(--text-medium)',
                fontWeight: 'var(--font-medium)',
                cursor: inputValue ? 'pointer' : 'not-allowed',
                opacity: inputValue ? 1 : 0.5,
                transition: 'all var(--duration-normal) var(--ease-out)',
                textTransform: 'lowercase',
                fontFamily: 'Roboto, sans-serif'
              }}
              whileHover={inputValue ? { scale: 1.05 } : {}}
              whileTap={inputValue ? { scale: 0.95 } : {}}
            >
              {currentStep === steps.length - 1 ? 'complete' : 'continue'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}