
import React, { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface TransportStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function TransportStep({ data, onNext, onBack }: TransportStepProps) {
  const [transport, setTransport] = useState<OnboardingData['transport'] | null>(data.transport || null);
  const [carType, setCarType] = useState<OnboardingData['carType'] | null>(data.carType || null);
  const [showCarType, setShowCarType] = useState(false);

  const handleNext = () => {
    if (transport) {
      if (transport === 'car' && !carType) {
        setShowCarType(true);
      } else {
        onNext({ transport, carType: transport === 'car' ? carType : undefined });
      }
    }
  };

  const handleCarTypeNext = () => {
    if (carType) {
      onNext({ transport, carType });
    }
  };

  const transportOptions: { value: OnboardingData['transport']; label: string }[] = [
    { value: 'car', label: 'car' },
    { value: 'public', label: 'public transport' },
    { value: 'bike', label: 'bike' },
    { value: 'walk', label: 'walk' },
    { value: 'mixed', label: 'mixed' },
  ];

  const carTypeOptions: { value: OnboardingData['carType']; label: string }[] = [
    { value: 'petrol', label: 'petrol' },
    { value: 'diesel', label: 'diesel' },
    { value: 'hybrid', label: 'hybrid' },
    { value: 'electric', label: 'electric' },
  ];

  if (showCarType) {
    return (
      <div className="space-y-12">
        <div className="space-y-6">
          <div>
            <button onClick={() => setShowCarType(false)} className="zz-circle-button">
              ←
            </button>
          </div>
          
          <div className="space-y-4">
            <h1 className="zz-h1">what type of car?</h1>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="zz-pill-container">
            {carTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCarType(option.value)}
                className={`zz-pill ${
                  carType === option.value ? 'selected' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="opacity-60">
              <p className="zz-p1">
                {carType && `car type: ${carType}`}
              </p>
            </div>
            
            <button 
              onClick={handleCarTypeNext} 
              disabled={!carType}
              className={`zz-circle-button ${
                !carType ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div>
          <button onClick={onBack} className="zz-circle-button">
            ←
          </button>
        </div>
        
        <div className="space-y-4">
          <h1 className="zz-h1">how do you travel?</h1>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="zz-pill-container">
          {transportOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTransport(option.value)}
              className={`zz-pill ${
                transport === option.value ? 'selected' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="opacity-60">
            <p className="zz-p1">
              {transport && `transport: ${transport}`}
            </p>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={!transport}
            className={`zz-circle-button ${
              !transport ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
