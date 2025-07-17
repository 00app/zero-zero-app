
import React, { useState, useEffect } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface NameStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  isDark?: boolean;
}

export function NameStep({ data, onNext, onBack, isDark }: NameStepProps) {
  const [name, setName] = useState(data.name || '');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(name.trim().length > 1);
  }, [name]);

  const handleNext = () => {
    if (isReady) {
      onNext({ name: name.trim() });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isReady) {
      handleNext();
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div>
          <button 
            onClick={onBack} 
            className="zz-circle-button"
          >
            ←
          </button>
        </div>
        
        <div className="space-y-4">
          <h1 className="zz-h1">what's your name?</h1>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="max-w-lg">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="enter your first name"
            className="zz-input text-2xl py-6"
            autoFocus
            autoComplete="given-name"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="opacity-60">
            <p className="zz-p1">
              {name.trim() && `hello ${name.trim()}`}
            </p>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={!isReady}
            className={`zz-circle-button ${
              !isReady ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
