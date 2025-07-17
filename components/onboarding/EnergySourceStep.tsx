
import React, { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface EnergySourceStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function EnergySourceStep({ data, onNext, onBack }: EnergySourceStepProps) {
  const [energySource, setEnergySource] = useState<OnboardingData['energySource'] | null>(data.energySource || null);

  const handleNext = () => {
    if (energySource) {
      onNext({ energySource });
    }
  };

  const options: { value: OnboardingData['energySource']; label: string }[] = [
    { value: 'grid', label: 'grid electricity' },
    { value: 'renewable', label: 'renewable energy' },
    { value: 'mixed', label: 'mixed sources' },
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
          <h1 className="zz-h1">energy source?</h1>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="zz-pill-container">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setEnergySource(option.value)}
              className={`zz-pill ${
                energySource === option.value ? 'selected' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="opacity-60">
            <p className="zz-p1">
              {energySource && `energy: ${energySource}`}
            </p>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={!energySource}
            className={`zz-circle-button ${
              !energySource ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
