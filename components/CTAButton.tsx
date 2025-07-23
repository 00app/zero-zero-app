
import React from 'react';

interface CTAButtonProps {
  onBegin: () => void;
}

export function CTAButton({ onBegin }: CTAButtonProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-6" style={{ background: 'var(--zz-bg)', color: 'var(--zz-text)' }}>
      <div className="text-center">
        <button 
          onClick={onBegin}
          className="zz-cta-button zz-fade-in"
          style={{
            animationDelay: '0.3s' // Slight delay for smooth entrance
          }}
        >
          begin
        </button>
      </div>
    </div>
  );
}
