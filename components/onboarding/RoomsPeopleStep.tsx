import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlitchText } from '../effects/GlitchText';
import { useGlitchAnimation } from '../hooks/useGlitchAnimation';

interface RoomsPeopleStepProps {
  onComplete: (data: { rooms: number; people: number }) => void;
  initialValue?: { rooms: number; people: number };
}

export function RoomsPeopleStep({ onComplete, initialValue }: RoomsPeopleStepProps) {
  const [rooms, setRooms] = useState(initialValue?.rooms || 1);
  const [people, setPeople] = useState(initialValue?.people || 1);
  const [questionText, setQuestionText] = useState('');
  const [showControls, setShowControls] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const isGlitching = useGlitchAnimation(1500);

  const fullQuestion = "how many rooms and people?";
  const typingSpeed = 60;

  useEffect(() => {
    let currentChar = 0;
    const typeInterval = setInterval(() => {
      if (currentChar <= fullQuestion.length) {
        setQuestionText(fullQuestion.slice(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowControls(true);
          setShowContinue(true);
        }, 300);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, []);

  const handleComplete = () => {
    onComplete({ rooms, people });
  };

  const updateRooms = (delta: number) => {
    const newRooms = Math.max(1, Math.min(20, rooms + delta));
    setRooms(newRooms);
  };

  const updatePeople = (delta: number) => {
    const newPeople = Math.max(1, Math.min(20, people + delta));
    setPeople(newPeople);
  };

  return (
    <div className="space-y-8">
      {/* Question */}
      <div className="text-left">
        <div 
          className="zz-large mb-8"
          style={{ 
            fontWeight: 'var(--font-regular)',
            lineHeight: 1.2,
            minHeight: '29px',
            textAlign: 'left'
          }}
        >
          {questionText}
          {questionText.length < fullQuestion.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1 h-6 ml-1"
              style={{ background: 'var(--zz-text)' }}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rooms */}
            <div className="space-y-4">
              <div 
                className="zz-medium text-left opacity-70"
                style={{ lineHeight: 1.4 }}
              >
                rooms
              </div>
              <div className="flex items-center justify-start space-x-6">
                <button
                  onClick={() => updateRooms(-1)}
                  className="zz-circle-button"
                  disabled={rooms <= 1}
                  style={{ 
                    width: '48px', 
                    height: '48px',
                    fontSize: '20px'
                  }}
                >
                  −
                </button>
                <div 
                  className="zz-large min-w-[80px] text-center"
                  style={{ 
                    fontSize: '48px',
                    fontWeight: 'var(--font-light)',
                    lineHeight: 1
                  }}
                >
                  {rooms}
                </div>
                <button
                  onClick={() => updateRooms(1)}
                  className="zz-circle-button"
                  disabled={rooms >= 20}
                  style={{ 
                    width: '48px', 
                    height: '48px',
                    fontSize: '20px'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* People */}
            <div className="space-y-4">
              <div 
                className="zz-medium text-left opacity-70"
                style={{ lineHeight: 1.4 }}
              >
                people
              </div>
              <div className="flex items-center justify-start space-x-6">
                <button
                  onClick={() => updatePeople(-1)}
                  className="zz-circle-button"
                  disabled={people <= 1}
                  style={{ 
                    width: '48px', 
                    height: '48px',
                    fontSize: '20px'
                  }}
                >
                  −
                </button>
                <div 
                  className="zz-large min-w-[80px] text-center"
                  style={{ 
                    fontSize: '48px',
                    fontWeight: 'var(--font-light)',
                    lineHeight: 1
                  }}
                >
                  {people}
                </div>
                <button
                  onClick={() => updatePeople(1)}
                  className="zz-circle-button"
                  disabled={people >= 20}
                  style={{ 
                    width: '48px', 
                    height: '48px',
                    fontSize: '20px'
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="text-center">

          </div>

          {/* Continue Button */}
          {showContinue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex justify-end"
            >
              <button
                onClick={handleComplete}
                className="zz-circle-button"
                style={{
                  width: '56px',
                  height: '56px',
                  fontSize: '20px',
                  border: 'none',
                  background: 'var(--zz-accent)',
                  color: 'var(--zz-bg)',
                  fontFamily: 'Roboto, sans-serif'
                }}
                aria-label="Continue to next step"
              >
                <GlitchText isGlitching={isGlitching}>
                  →
                </GlitchText>
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}