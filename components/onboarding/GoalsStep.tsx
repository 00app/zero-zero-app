
import React, { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface GoalsStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const availableGoals = [
  'save money',
  'reduce carbon footprint',
  'improve health',
  'eat better',
  'use less energy',
  'walk more',
  'cycle more',
  'reduce waste',
  'buy local',
  'grow food',
  'repair instead of buy',
  'use public transport'
];

export function GoalsStep({ data, onNext, onBack }: GoalsStepProps) {
  const [goals, setGoals] = useState<string[]>(data.goals || []);

  const toggleGoal = (goal: string) => {
    const newGoals = goals.includes(goal)
      ? goals.filter(g => g !== goal)
      : [...goals, goal];
    
    setGoals(newGoals);
  };

  const handleNext = () => {
    onNext({ goals });
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
          <h1 className="zz-h1">what are your goals?</h1>
          <p className="zz-p1 opacity-70 max-w-2xl">
            select multiple goals to personalize your sustainability journey
          </p>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="zz-pill-container max-h-[400px] overflow-y-auto">
          {availableGoals.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`zz-pill ${
                goals.includes(goal) ? 'selected' : ''
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="opacity-60">
            <p className="zz-p1">
              {goals.length > 0 && `${goals.length} goal${goals.length !== 1 ? 's' : ''} selected`}
            </p>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={goals.length === 0}
            className={`zz-circle-button ${
              goals.length === 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
