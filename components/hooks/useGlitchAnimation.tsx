import { useState, useEffect } from "react";

export function useGlitchAnimation(duration = 1500) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    setIsGlitching(true);
    const timer = setTimeout(() => {
      setIsGlitching(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return isGlitching;
}