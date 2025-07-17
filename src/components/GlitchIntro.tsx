import { useEffect, useState } from 'react';

interface GlitchIntroProps {
  onComplete: () => void;
}

export function GlitchIntro({ onComplete }: GlitchIntroProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="zz-glitch-container">
        <h1 className="zz-glitch-text">zero</h1>
      </div>
    </div>
  );
}