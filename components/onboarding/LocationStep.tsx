
import React, { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface LocationStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function LocationStep({ data, onNext, onBack }: LocationStepProps) {
  const [postcode, setPostcode] = useState(data.postcode || '');

  const handleNext = () => {
    if (postcode.trim()) {
      onNext({ postcode: postcode.trim().toUpperCase() });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && postcode.trim()) {
      handleNext();
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div>
          <button onClick={onBack} className="zz-circle-button">
            ←
          </button>
        </div>
        
        <div className="space-y-4">
          <h1 className="zz-h1">what's your postcode?</h1>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="max-w-lg">
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="enter postcode"
            className="zz-input text-2xl py-6"
            autoFocus
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="opacity-60">
            <p className="zz-p1">
              {postcode.trim() && `location: ${postcode.trim().toUpperCase()}`}
            </p>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={!postcode.trim()}
            className={`zz-circle-button ${
              !postcode.trim() ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
