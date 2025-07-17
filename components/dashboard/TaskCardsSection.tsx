import React, { useState } from 'react';
import { ExpandableTaskCard } from './ExpandableTaskCard';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface TaskCardsProps {
  userData: OnboardingData;
  isDark: boolean;
}

export function TaskCardsSection({ userData, isDark }: TaskCardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  // Generate task cards based on user data
  const taskCards = [
    {
      id: 1,
      title: 'track your energy usage',
      description: 'monitor your daily electricity consumption',
      footprintData: {
        current: 4.2,
        target: 3.1,
        unit: 'kg co₂/day',
        animalEquivalent: 'small dog',
        tips: ['unplug devices when not in use', 'use led bulbs', 'set thermostat 1°c lower']
      },
      questions: [
        {
          id: 'q1',
          question: 'how many hours do you leave lights on unnecessarily?',
          options: ['less than 1 hour', '1-3 hours', '3-5 hours', 'more than 5 hours']
        },
        {
          id: 'q2', 
          question: 'do you unplug electronics when not in use?',
          options: ['always', 'sometimes', 'rarely', 'never']
        }
      ]
    },
    {
      id: 2,
      title: 'reduce transport emissions',
      description: 'optimise your daily travel choices',
      footprintData: {
        current: 2.8,
        target: 1.5,
        unit: 'kg co₂/day',
        animalEquivalent: 'cat',
        tips: ['walk short distances', 'use public transport', 'cycle when possible']
      },
      questions: [
        {
          id: 'q3',
          question: 'how many car trips under 2km do you make weekly?',
          options: ['none', '1-2 trips', '3-5 trips', 'more than 5 trips']
        },
        {
          id: 'q4',
          question: 'do you combine errands into single trips?',
          options: ['always', 'usually', 'sometimes', 'never']
        }
      ]
    },
    {
      id: 3,
      title: 'minimise food waste',
      description: 'reduce your kitchen carbon footprint',
      footprintData: {
        current: 3.5,
        target: 2.2,
        unit: 'kg co₂/day',
        animalEquivalent: 'rabbit',
        tips: ['plan meals weekly', 'store food properly', 'use leftovers creatively']
      },
      questions: [
        {
          id: 'q5',
          question: 'how much food do you throw away weekly?',
          options: ['almost none', 'small amount', 'moderate amount', 'quite a lot']
        },
        {
          id: 'q6',
          question: 'do you meal plan before shopping?',
          options: ['always', 'usually', 'sometimes', 'never']
        }
      ]
    }
  ];

  const handleToggleCard = (cardIndex: number) => {
    setActiveCardIndex(activeCardIndex === cardIndex ? null : cardIndex);
  };

  const handleComplete = (cardId: number) => {
    console.log(`completed task ${cardId}`);
    // Move to next card automatically
    if (currentCardIndex < taskCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setActiveCardIndex(null);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < taskCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setActiveCardIndex(null);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setActiveCardIndex(null);
    }
  };

  const handleSwipeLeft = () => {
    handleNext();
  };

  const handleSwipeRight = () => {
    handlePrevious();
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="zz-large mb-4">today's focus</h2>
        <p className="zz-medium opacity-60">
          personalised actions for {userData.name} • {currentCardIndex + 1} of {taskCards.length}
        </p>
      </div>

      {/* Single Card Display - Typeform Style */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto mb-8">
        <ExpandableTaskCard
          cardData={{
            title: taskCards[currentCardIndex].title,
            icon: '→',
            stat: taskCards[currentCardIndex].footprintData.current.toString(),
            unit: taskCards[currentCardIndex].footprintData.unit,
            animal: taskCards[currentCardIndex].footprintData.animalEquivalent,
            contextualQuestion: taskCards[currentCardIndex].questions[0]?.question || 'how can you improve this area?',
            answerOptions: taskCards[currentCardIndex].questions[0]?.options || ['yes', 'no', 'sometimes'],
            impactChartData: [
              { name: 'current', value: taskCards[currentCardIndex].footprintData.current },
              { name: 'target', value: taskCards[currentCardIndex].footprintData.target },
              { name: 'reduction', value: Math.round((taskCards[currentCardIndex].footprintData.current - taskCards[currentCardIndex].footprintData.target) * 10) / 10 }
            ]
          }}
          userData={userData}
          isActive={activeCardIndex === currentCardIndex}
          onToggle={() => handleToggleCard(currentCardIndex)}
          onComplete={() => handleComplete(taskCards[currentCardIndex].id)}
          onNext={currentCardIndex < taskCards.length - 1 ? handleNext : undefined}
          onPrevious={currentCardIndex > 0 ? handlePrevious : undefined}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center space-x-6 mb-8">
        <button
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          className={`zz-circle-button ${currentCardIndex === 0 ? 'opacity-30' : ''}`}
        >
          ←
        </button>
        <button
          onClick={handleNext}
          disabled={currentCardIndex === taskCards.length - 1}
          className={`zz-circle-button ${currentCardIndex === taskCards.length - 1 ? 'opacity-30' : ''}`}
        >
          →
        </button>
      </div>

      {/* Progress Dots */}
      {taskCards.length > 1 && (
        <div className="flex justify-center space-x-2">
          {taskCards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentCardIndex(index);
                setActiveCardIndex(null);
              }}
              className={`w-3 h-3 border-2 border-current transition-all duration-300 ${
                index === currentCardIndex 
                  ? 'bg-current' 
                  : 'bg-transparent'
              }`}
              style={{ borderRadius: '0' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}