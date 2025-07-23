
import React, { useEffect, useState } from 'react';
import ZeroZeroBrandMark from '../imports/ZeroZeroBrandMark-12-36';

interface GlitchIntroProps {
  onComplete: () => void;
}

export function GlitchIntro({ onComplete }: GlitchIntroProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-complete after 1.2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 200); // Small delay for fade out
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`} style={{ background: 'var(--zz-bg)', color: 'var(--zz-text)' }}>
      <div className="zz-glitch-container">
        <div 
          className="zz-glitch-brand-mark"
          style={{
            width: '91px',
            height: '145px'
          }}
        >
          <ZeroZeroBrandMark />
        </div>
      </div>
    </div>
  );
}
