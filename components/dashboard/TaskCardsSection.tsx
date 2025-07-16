
import React, { useState } from 'react';
import { ExpandableTaskCard } from './ExpandableTaskCard';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface TaskCardData {
  title: string;
  icon: string; // Simple monochrome symbol
  stat: string;
  unit: string;
  animal: string;
  contextualQuestion: string;
  answerOptions: string[];
  impactChartData: Array<{ name: string; value: number }>;
}

interface TaskCardsSectionProps {
  userData: OnboardingData;
}

export function TaskCardsSection({ userData }: TaskCardsSectionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  // Generate contextual task cards based on exact specification
  const generateTaskCards = (): TaskCardData[] => {
    const cards: TaskCardData[] = [];

    // Carbon Saved Card (always show for grid users)
    if (userData.energySource === 'grid' || userData.transport === 'car') {
      cards.push({
        title: 'Carbon Saved',
        icon: '●', // Simple monochrome circle
        stat: '22.5',
        unit: 'kg',
        animal: 'koala',
        contextualQuestion: 'Do you use any heating or cooling daily?',
        answerOptions: [
          'Yes',
          'No', 
          'Sometimes'
        ],
        impactChartData: [
          { name: 'This Week', value: 22 },
          { name: 'Last Week', value: 18 },
          { name: '2 Weeks Ago', value: 25 },
          { name: '3 Weeks Ago', value: 15 }
        ]
      });
    }

    // Water Saved Card
    if (userData.goals.includes('water conservation') || userData.homeType === 'house') {
      cards.push({
        title: 'Water Saved',
        icon: '◦', // Simple monochrome circle outline
        stat: '180',
        unit: 'litres',
        animal: 'penguin',
        contextualQuestion: 'Do you shower daily?',
        answerOptions: [
          'Once a day',
          'Twice',
          'Every other day'
        ],
        impactChartData: [
          { name: 'Week 1', value: 180 },
          { name: 'Week 2', value: 165 },
          { name: 'Week 3', value: 190 },
          { name: 'Week 4', value: 175 }
        ]
      });
    }

    // Money Saved Card
    if (userData.monthlySpend > 2000) {
      cards.push({
        title: 'Money Saved',
        icon: '□', // Simple monochrome square
        stat: '48.6',
        unit: 'GBP',
        animal: 'pug',
        contextualQuestion: 'Would you switch to a green tariff?',
        answerOptions: [
          'Yes',
          'Already have',
          'Not sure'
        ],
        impactChartData: [
          { name: 'Month 1', value: 48 },
          { name: 'Month 2', value: 52 },
          { name: 'Month 3', value: 45 },
          { name: 'Month 4', value: 55 }
        ]
      });
    }

    // Transport Emissions Card
    if (userData.transport === 'car') {
      cards.push({
        title: 'Transport Impact',
        icon: '△', // Simple monochrome triangle
        stat: '95.2',
        unit: 'kg CO₂',
        animal: 'seal',
        contextualQuestion: 'How often could you walk or cycle instead?',
        answerOptions: [
          'Once a week',
          '2-3 times a week',
          'Every other day',
          'Only for long trips'
        ],
        impactChartData: [
          { name: 'This Month', value: 95 },
          { name: 'Last Month', value: 110 },
          { name: '2 Months Ago', value: 120 },
          { name: '3 Months Ago', value: 105 }
        ]
      });
    }

    // Waste Reduction Card
    if (userData.goals.includes('reduce waste')) {
      cards.push({
        title: 'Waste Reduced',
        icon: '◢', // Simple monochrome triangle
        stat: '12.8',
        unit: 'kg',
        animal: 'turtle',
        contextualQuestion: 'What causes most of your food waste?',
        answerOptions: [
          'Buying too much',
          'Forgetting leftovers',
          'Produce going bad',
          'Poor meal planning'
        ],
        impactChartData: [
          { name: 'Week 1', value: 12 },
          { name: 'Week 2', value: 8 },
          { name: 'Week 3', value: 15 },
          { name: 'Week 4', value: 10 }
        ]
      });
    }

    // Local Shopping Card
    if (userData.goals.includes('local shopping') || userData.goals.includes('buy local')) {
      cards.push({
        title: 'Local Impact',
        icon: '◇', // Simple monochrome diamond
        stat: '34.5',
        unit: 'km saved',
        animal: 'rabbit',
        contextualQuestion: 'What stops you shopping locally more?',
        answerOptions: [
          'Higher prices',
          'Limited selection',
          'Too far away',
          'Don\'t know options'
        ],
        impactChartData: [
          { name: 'Local Shops', value: 20 },
          { name: 'Markets', value: 10 },
          { name: 'Community', value: 8 },
          { name: 'Online Local', value: 6 }
        ]
      });
    }

    // Default starter card if no matches
    if (cards.length === 0) {
      cards.push({
        title: 'Start Small',
        icon: '○', // Simple monochrome circle
        stat: '5.2',
        unit: 'actions',
        animal: 'hamster',
        contextualQuestion: 'What small change feels most achievable?',
        answerOptions: [
          'Recycle consistently',
          'Use reusable bags',
          'Turn off lights',
          'Walk short trips'
        ],
        impactChartData: [
          { name: 'Day 1', value: 1 },
          { name: 'Day 2', value: 3 },
          { name: 'Day 3', value: 4 },
          { name: 'Day 4', value: 5 }
        ]
      });
    }

    return cards;
  };

  const taskCards = generateTaskCards();

  const handleNext = () => {
    if (currentCardIndex < taskCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setActiveCardIndex(null); // Close expanded card
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setActiveCardIndex(null); // Close expanded card
    }
  };

  const handleSwipeLeft = () => {
    handleNext();
  };

  const handleSwipeRight = () => {
    handlePrevious();
  };

  const handleToggleCard = (index: number) => {
    // Typeform-style: only one card open at a time
    setActiveCardIndex(activeCardIndex === index ? null : index);
  };

  const handleComplete = () => {
    console.log(`Task completed: ${taskCards[currentCardIndex].title}`);
    // Auto-advance to next card after completion
    setTimeout(() => {
      if (currentCardIndex < taskCards.length - 1) {
        handleNext();
      }
    }, 1000);
  };

  if (taskCards.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="zz-h2 mb-4">today's focus</h2>
        <p className="zz-p1 opacity-60">
          personalized actions for {userData.name} • {currentCardIndex + 1} of {taskCards.length}
        </p>
      </div>

      {/* Single Card Display - Typeform Style */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto mb-8">
        <ExpandableTaskCard
          cardData={taskCards[currentCardIndex]}
          userData={userData}
          isActive={activeCardIndex === currentCardIndex}
          onToggle={() => handleToggleCard(currentCardIndex)}
          onComplete={handleComplete}
          onNext={currentCardIndex < taskCards.length - 1 ? handleNext : undefined}
          onPrevious={currentCardIndex > 0 ? handlePrevious : undefined}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
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
              className={`zz-progress-dot ${
                index === currentCardIndex ? 'active' : ''
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
