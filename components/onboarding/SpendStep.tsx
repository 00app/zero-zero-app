
import React, { useState } from 'react';

interface SpendStepProps {
  onComplete: (value: number) => void;
  initialValue?: number;
}

export function SpendStep({ onComplete, initialValue }: SpendStepProps) {
  const [monthlySpend, setMonthlySpend] = useState(initialValue || 2000);

  const handleNext = () => {
    onComplete(monthlySpend);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlySpend(parseInt(e.target.value));
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
            monthly spending?
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-2 text-left">
          <div style={{ 
            fontSize: '48px',
            fontWeight: 'var(--font-medium)', 
            lineHeight: 1.2,
            fontFamily: 'Roboto, sans-serif',
            color: 'var(--zz-text)'
          }}>
            £{monthlySpend.toLocaleString()}
          </div>
          <div style={{ 
            fontSize: '16px',
            fontWeight: 'var(--font-regular)', 
            lineHeight: 1.4,
            fontFamily: 'Roboto, sans-serif',
            color: 'var(--zz-text)',
            opacity: 0.6,
            textTransform: 'lowercase'
          }}>
            per month
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min="500"
            max="10000"
            step="100"
            value={monthlySpend}
            onChange={handleSliderChange}
            className="w-full h-2 appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--zz-accent) 0%, var(--zz-accent) ${((monthlySpend - 500) / (10000 - 500)) * 100}%, var(--zz-grey) ${((monthlySpend - 500) / (10000 - 500)) * 100}%, var(--zz-grey) 100%)`,
              outline: 'none',
              border: 'none'
            }}
          />
          
          <div className="flex justify-between">
            <span style={{ 
              fontSize: '14px',
              fontWeight: 'var(--font-regular)', 
              lineHeight: 1.3,
              fontFamily: 'Roboto, sans-serif',
              color: 'var(--zz-text)',
              opacity: 0.5
            }}>
              £500
            </span>
            <span style={{ 
              fontSize: '14px',
              fontWeight: 'var(--font-regular)', 
              lineHeight: 1.3,
              fontFamily: 'Roboto, sans-serif',
              color: 'var(--zz-text)',
              opacity: 0.5
            }}>
              £10,000
            </span>
          </div>
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
              £{monthlySpend.toLocaleString()}/month
            </div>
          </div>
          
          <button 
            onClick={handleNext} 
            className="zz-circle-button"
            style={{
              width: '56px',
              height: '56px',
              fontSize: '20px',
              border: 'none',
              background: 'var(--zz-accent)',
              color: 'var(--zz-bg)',
              fontFamily: 'Roboto, sans-serif',
              cursor: 'pointer'
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
