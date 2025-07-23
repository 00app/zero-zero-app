import React, { useEffect, useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface IntroStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  isDark?: boolean;
}

export function IntroStep({ onNext, isDark }: IntroStepProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Auto-advance after a brief pause to let user orient
    const timer = setTimeout(() => {
      setIsReady(true);
      setTimeout(() => onNext({}), 1000);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="space-y-12">
      <div className="text-center space-y-8">
        <div className="zz-fade-in">
          <h1 className="zz-h1">let's get started</h1>
          <p className="zz-p1 opacity-70 mt-6 max-w-2xl mx-auto">
            we'll ask a few questions to understand your lifestyle and calculate your environmental impact
          </p>
        </div>
        
        {isReady && (
          <div className="zz-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex justify-center">
              <div className="w-16 h-1 bg-current opacity-30 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}