import React, { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface HomeTypeStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function HomeTypeStep({ data, onNext, onBack }: HomeTypeStepProps) {
  const [homeType, setHomeType] = useState<OnboardingData['homeType'] | null>(data.homeType || null);

  const handleNext = () => {
    if (homeType) {
      onNext({ homeType });
    }
  };

  const options: { value: OnboardingData['homeType']; label: string }[] = [
    { value: 'flat', label: 'flat' },
    { value: 'house', label: 'house' },
    { value: 'shared', label: 'shared house' },
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div>
          <button onClick={onBack} className="zz-circle-button">
            ←
          </button>
        </div>
        
        <div className="space-y-4">
          <h1 className="zz-h1">what type of home?</h1>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="zz-pill-container">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setHomeType(option.value)}
              className={`zz-pill ${
                homeType === option.value ? 'selected' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="opacity-60">
            <p className="zz-medium">
              {homeType && `home type: ${homeType}`}
            </p>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={!homeType}
            className={`zz-circle-button ${
              !homeType ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}