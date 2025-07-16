
import React, { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface SpendStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SpendStep({ data, onNext, onBack }: SpendStepProps) {
  const [monthlySpend, setMonthlySpend] = useState(data.monthlySpend || 2000);

  const handleNext = () => {
    onNext({ monthlySpend });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlySpend(parseInt(e.target.value));
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
          <h1 className="zz-h1">monthly spending?</h1>
          <p className="zz-p1 opacity-70 max-w-2xl">
            helps us calculate potential savings and suggest money-saving opportunities
          </p>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="zz-h2">£{monthlySpend.toLocaleString()}</h2>
          <p className="zz-p1 opacity-60">per month</p>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min="500"
            max="10000"
            step="100"
            value={monthlySpend}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, var(--zz-accent) 0%, var(--zz-accent) ${((monthlySpend - 500) / (10000 - 500)) * 100}%, var(--zz-border) ${((monthlySpend - 500) / (10000 - 500)) * 100}%, var(--zz-border) 100%)`
            }}
          />
          
          <div className="flex justify-between">
            <span className="zz-p1 opacity-50">£500</span>
            <span className="zz-p1 opacity-50">£10,000</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="opacity-60">
            <p className="zz-p1">
              {monthlySpend && `£${monthlySpend.toLocaleString()}/month`}
            </p>
          </div>
          
          <button 
            onClick={handleNext} 
            className="zz-circle-button"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
