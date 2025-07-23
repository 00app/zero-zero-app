
import React, { useState } from 'react';
import { GlitchText } from '../effects/GlitchText';
import { useGlitchAnimation } from '../hooks/useGlitchAnimation';

interface EnergySourceStepProps {
  onComplete: (value: string) => void;
  initialValue?: string;
}

export function EnergySourceStep({ onComplete, initialValue }: EnergySourceStepProps) {
  const [energySource, setEnergySource] = useState<string>(initialValue || '');
  const isGlitching = useGlitchAnimation(1500);

  const handleNext = () => {
    if (energySource) {
      onComplete(energySource);
    }
  };

  const options = [
    { value: 'grid', label: 'grid electricity' },
    { value: 'renewable', label: 'renewable energy' },
    { value: 'mixed', label: 'mixed sources' },
  ];

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
            energy source?
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setEnergySource(option.value)}
              className="w-full py-4 px-6 border-2 text-left transition-all duration-300"
              style={{
                borderColor: energySource === option.value ? 'var(--zz-accent)' : 'var(--zz-border)',
                background: energySource === option.value ? 'var(--zz-accent)' : 'transparent',
                color: energySource === option.value ? 'var(--zz-bg)' : 'var(--zz-text)',
                fontSize: '18px',
                fontWeight: 'var(--font-regular)',
                fontFamily: 'Roboto, sans-serif',
                lineHeight: 1.2,
                textTransform: 'lowercase',
                borderRadius: '0'
              }}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                <span style={{ fontSize: '16px' }}>
                  {energySource === option.value ? '✓' : ''}
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
              {energySource && `selected: ${energySource}`}
            </div>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={!energySource}
            className="zz-circle-button"
            style={{
              width: '56px',
              height: '56px',
              fontSize: '20px',
              border: 'none',
              background: energySource ? 'var(--zz-accent)' : 'var(--zz-border)',
              color: energySource ? 'var(--zz-bg)' : 'var(--zz-text)',
              fontFamily: 'Roboto, sans-serif',
              cursor: energySource ? 'pointer' : 'not-allowed',
              opacity: energySource ? 1 : 0.3
            }}
            aria-label="Continue to next step"
          >
            <GlitchText isGlitching={isGlitching && energySource !== ''}>
              →
            </GlitchText>
          </button>
        </div>
      </div>
    </div>
  );
}
