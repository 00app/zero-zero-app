
import React, { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';
import { GlitchText } from '../effects/GlitchText';
import { useGlitchAnimation } from '../hooks/useGlitchAnimation';

interface TransportStepProps {
  onComplete: (value: string[]) => void;
  initialValue?: string[];
}

export function TransportStep({ onComplete, initialValue }: TransportStepProps) {
  const [transport, setTransport] = useState<string[]>(initialValue || []);
  const handleNext = () => {
    if (transport.length > 0) {
      onComplete(transport);
    }
  };

  const toggleTransport = (option: string) => {
    setTransport(prev => {
      if (prev.includes(option)) {
        return prev.filter(t => t !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const transportOptions = [
    { value: 'car', label: 'car' },
    { value: 'public', label: 'public transport' },
    { value: 'bike', label: 'bike' },
    { value: 'walk', label: 'walk' },
    { value: 'mixed', label: 'mixed' },
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
            how do you travel?
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
        <div className="flex flex-col gap-4">
          {transportOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleTransport(option.value)}
              className="w-full py-4 px-6 border-2 text-left transition-all duration-300"
              style={{
                borderColor: transport.includes(option.value) ? 'var(--zz-accent)' : 'var(--zz-border)',
                background: transport.includes(option.value) ? 'var(--zz-accent)' : 'transparent',
                color: transport.includes(option.value) ? 'var(--zz-bg)' : 'var(--zz-text)',
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
                  {transport.includes(option.value) ? '✓' : '+'}
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
              {transport.length > 0 && `selected: ${transport.join(', ')}`}
            </div>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={transport.length === 0}
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300"
            style={{
              borderColor: transport.length > 0 ? 'var(--zz-accent)' : 'var(--zz-border)',
              background: 'transparent',
              color: transport.length > 0 ? 'var(--zz-text)' : 'var(--zz-border)',
              fontSize: '20px',
              lineHeight: 1,
              cursor: transport.length > 0 ? 'pointer' : 'not-allowed',
              opacity: transport.length > 0 ? 1 : 0.3
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
