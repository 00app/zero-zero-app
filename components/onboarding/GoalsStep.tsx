
import React, { useState } from 'react';

interface GoalsStepProps {
  onComplete: (value: string[]) => void;
  initialValue?: string[];
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

export function GoalsStep({ onComplete, initialValue }: GoalsStepProps) {
  const [goals, setGoals] = useState<string[]>(initialValue || []);

  const toggleGoal = (goal: string) => {
    const newGoals = goals.includes(goal)
      ? goals.filter(g => g !== goal)
      : [...goals, goal];
    
    setGoals(newGoals);
  };

  const handleNext = () => {
    onComplete(goals);
  };

  return (
    <div className="space-y-12">
      <div className="space-y-6 text-left">
        <div className="space-y-4">
          <div 
            style={{ 
              fontSize: '32px',
              fontWeight: 'var(--font-regular)', 
              lineHeight: 1.2,
              fontFamily: 'Roboto, sans-serif',
              color: 'var(--zz-text)',
              textTransform: 'lowercase'
            }}
          >
            what are your goals?
          </div>
          <div 
            style={{ 
              fontSize: '16px',
              fontWeight: 'var(--font-regular)', 
              lineHeight: 1.4,
              fontFamily: 'Roboto, sans-serif',
              color: 'var(--zz-text)',
              opacity: 0.6,
              textTransform: 'lowercase'
            }}
          >
            select all that apply
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto py-2">
          {availableGoals.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className="py-3 px-4 border-2 text-left transition-all duration-300"
              style={{
                borderColor: goals.includes(goal) ? 'var(--zz-accent)' : 'var(--zz-border)',
                background: goals.includes(goal) ? 'var(--zz-accent)' : 'transparent',
                color: goals.includes(goal) ? 'var(--zz-bg)' : 'var(--zz-text)',
                fontSize: '14px',
                fontWeight: 'var(--font-regular)',
                fontFamily: 'Roboto, sans-serif',
                lineHeight: 1.3,
                textTransform: 'lowercase',
                borderRadius: '0'
              }}
            >
              <div className="flex items-center justify-between">
                <span>{goal}</span>
                <span style={{ fontSize: '12px' }}>
                  {goals.includes(goal) ? '✓' : '+'}
                </span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-4">
          <div style={{ opacity: 0.6 }}>
            <div 
              style={{ 
                fontSize: '14px',
                fontWeight: 'var(--font-regular)', 
                lineHeight: 1.3,
                fontFamily: 'Roboto, sans-serif',
                color: 'var(--zz-text)',
                textTransform: 'lowercase'
              }}
            >
              {goals.length > 0 && `${goals.length} goal${goals.length !== 1 ? 's' : ''} selected`}
            </div>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={goals.length === 0}
            className="zz-circle-button"
            style={{
              width: '56px',
              height: '56px',
              fontSize: '20px',
              border: 'none',
              background: goals.length > 0 ? 'var(--zz-accent)' : 'var(--zz-border)',
              color: goals.length > 0 ? 'var(--zz-bg)' : 'var(--zz-text)',
              fontFamily: 'Roboto, sans-serif',
              cursor: goals.length > 0 ? 'pointer' : 'not-allowed',
              opacity: goals.length > 0 ? 1 : 0.3
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
