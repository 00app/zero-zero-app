import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NameStep } from './NameStep';
import { LocationStep } from './LocationStep';
import { HomeTypeStep } from './HomeTypeStep';
import { RoomsPeopleStep } from './RoomsPeopleStep';
import { TransportStep } from './TransportStep';
import { EnergySourceStep } from './EnergySourceStep';
import { SpendStep } from './SpendStep';
import { GoalsStep } from './GoalsStep';

export interface OnboardingData {
  name: string;
  location: string;
  homeType: string;
  roomsAndPeople: { rooms: number; people: number };
  transport: string[];
  energySource: string;
  monthlySpend: number;
  goals: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export function OnboardingFlow({ onComplete, isDark, onThemeToggle }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const steps = [
    { component: NameStep, key: 'name' },
    { component: LocationStep, key: 'location' },
    { component: HomeTypeStep, key: 'homeType' },
    { component: RoomsPeopleStep, key: 'roomsAndPeople' },
    { component: TransportStep, key: 'transport' },
    { component: EnergySourceStep, key: 'energySource' },
    { component: SpendStep, key: 'monthlySpend' },
    { component: GoalsStep, key: 'goals' }
  ];

  const handleStepComplete = (stepData: any) => {
    const stepKey = steps[currentStep].key;
    const newData = { ...data };
    
    // Handle the data based on step key
    if (stepKey === 'roomsAndPeople') {
      newData[stepKey] = stepData; // This should be an object { rooms: number, people: number }
    } else {
      newData[stepKey as keyof Partial<OnboardingData>] = stepData;
    }
    
    setData(newData);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps complete
      onComplete(newData as OnboardingData);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepNavigation = (stepIndex: number) => {
    // Allow navigation to any step
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: 'var(--zz-bg)', 
      color: 'var(--zz-text)'
    }}>
      {/* Header with theme toggle */}
      <div className="w-full px-6 py-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            {currentStep > 0 && (
              <button
                onClick={handleStepBack}
                className="zz-circle-button"
                style={{ 
                  width: '40px', 
                  height: '40px',
                  fontSize: '18px'
                }}
              >
                ←
              </button>
            )}
          </div>
          
          <button
            onClick={onThemeToggle}
            className="zz-circle-button"
            style={{ 
              width: '40px', 
              height: '40px',
              fontSize: '16px'
            }}
          >
            {isDark ? '☀' : '●'}
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="w-full px-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-start gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepNavigation(index)}
                className="zz-progress-dot"
                style={{
                  background: index <= currentStep ? 'var(--zz-accent)' : 'transparent',
                  borderColor: index <= currentStep ? 'var(--zz-accent)' : 'var(--zz-border)'
                }}
                aria-label={`${index < currentStep ? 'Return to' : index === currentStep ? 'Current' : 'Skip to'} step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.16, 1, 0.3, 1] 
              }}
            >
              <CurrentStepComponent
                onComplete={handleStepComplete}
                initialValue={data[steps[currentStep].key as keyof OnboardingData]}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}