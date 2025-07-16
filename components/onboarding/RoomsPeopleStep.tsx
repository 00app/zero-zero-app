
import React, { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface RoomsPeopleStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function RoomsPeopleStep({ data, onNext, onBack }: RoomsPeopleStepProps) {
  const [rooms, setRooms] = useState(data.rooms || 1);
  const [people, setPeople] = useState(data.people || 1);

  const handleNext = () => {
    onNext({ rooms, people });
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
    <div className="space-y-12">
      <div className="space-y-6">
        <div>
          <button onClick={onBack} className="zz-circle-button">
            ←
          </button>
        </div>
        
        <div className="space-y-4">
          <h1 className="zz-h1">how many rooms & people?</h1>
          <p className="zz-p1 opacity-70 max-w-2xl">
            this helps us calculate your home's energy usage and carbon footprint per person
          </p>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="zz-p1 opacity-80">rooms</p>
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => updateRooms(-1)}
                className="zz-circle-button"
                disabled={rooms <= 1}
              >
                −
              </button>
              <div className="zz-h2 min-w-[80px] text-center">{rooms}</div>
              <button
                onClick={() => updateRooms(1)}
                className="zz-circle-button"
                disabled={rooms >= 20}
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="zz-p1 opacity-80">people</p>
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => updatePeople(-1)}
                className="zz-circle-button"
                disabled={people <= 1}
              >
                −
              </button>
              <div className="zz-h2 min-w-[80px] text-center">{people}</div>
              <button
                onClick={() => updatePeople(1)}
                className="zz-circle-button"
                disabled={people >= 20}
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="opacity-60">
            <p className="zz-p1">
              {rooms} room{rooms !== 1 ? 's' : ''}, {people} person{people !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button 
            onClick={handleNext} 
            className="zz-circle-button"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
