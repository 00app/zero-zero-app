
import React, { useState, useEffect } from 'react';
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

interface ExpandableTaskCardProps {
  cardData: TaskCardData;
  userData: OnboardingData;
  isActive: boolean; // Only one card active at a time (Typeform style)
  onToggle: () => void;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function ExpandableTaskCard({ 
  cardData, 
  userData, 
  isActive,
  onToggle,
  onComplete, 
  onNext, 
  onPrevious,
  onSwipeLeft,
  onSwipeRight
}: ExpandableTaskCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showTipsMore, setShowTipsMore] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Swipe gesture detection
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  const handleMarkAsDone = () => {
    setIsCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleToggleTips = () => {
    setShowTipsMore(!showTipsMore);
  };

  return (
    <div 
      className={`w-full transition-all duration-300 ease-out ${
        isActive ? 'mb-8' : 'mb-4'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      <div
        className={`zz-task-card ${isActive ? 'expanded' : ''}`}
        style={{
          background: 'var(--zz-card)',
          borderRadius: '20px',
          padding: '24px',
          // Removed boxShadow and transition
          width: '100%',
        }}
      >
        {/* Card Header - Always Visible */}
        <div
          className="cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Simple monochrome icon */}
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="zz-medium">
                  {cardData.icon}
                </span>
              </div>
              <h3 className="zz-large">{cardData.title}</h3>
            </div>
            <span className={`text-lg transition-transform duration-200 ${
              isActive ? 'rotate-180' : 'rotate-0'
            }`}>
              ↓
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="zz-large">{cardData.stat}</span>
              <span className="zz-medium opacity-60">{cardData.unit}</span>
            </div>
            
            {/* Prominent animal comparison */}
            <p className="zz-medium opacity-80">
              that's like saving the weight of a {cardData.animal}!
            </p>
          </div>

          {isCompleted && (
            <div className="mt-4 flex items-center space-x-2 zz-task-completed">
              <span className="text-lg">✓</span>
              <span className="zz-medium">completed</span>
            </div>
          )}
        </div>

        {/* Expanded Content - Typeform Style */}
        {isActive && (
          <div className="mt-6 pt-6 border-t border-current border-opacity-20 zz-fade-in">
            
            {/* Contextual Question */}
            <div className="mb-6">
              <h4 className="zz-medium mb-4">{cardData.contextualQuestion}</h4>
              <div className="space-y-3">
                {(cardData.answerOptions || []).map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-4 border-2 border-current transition-all duration-200 ${
                      selectedAnswer === option 
                        ? 'bg-current bg-opacity-10 border-opacity-60 transform scale-[1.02]' 
                        : 'border-opacity-20 hover:border-opacity-40 hover:transform hover:translateY(-1px)'
                    }`}
                    style={{ borderRadius: '12px' }}
                  >
                    <span className="zz-medium">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between py-4">
                <span className="zz-medium">would you like to see tips like this more often?</span>
                <button
                  onClick={handleToggleTips}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    showTipsMore 
                      ? 'bg-current' 
                      : 'bg-current bg-opacity-20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      showTipsMore ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Impact Over Time Chart */}
            <div className="mb-6">
              <h4 className="zz-medium mb-4">your impact over time</h4>
              <div className="space-y-3">
                {(cardData.impactChartData || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="zz-small opacity-70">{item.name}</span>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="zz-chart-bar"
                        style={{ 
                          width: `${Math.max(20, (item.value / Math.max(...cardData.impactChartData.map(d => d.value))) * 120)}px`,
                          height: '8px',
                          borderRadius: '2px'
                        }}
                      />
                      <span className="zz-small w-8 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMarkAsDone}
                disabled={isCompleted}
                className={`zz-pill ${
                  isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-current hover:text-bg'
                }`}
              >
                {isCompleted ? 'completed' : 'mark as done'}
              </button>
              
              {onPrevious && (
                <button
                  onClick={onPrevious}
                  className="zz-pill hover:bg-current hover:text-bg"
                >
                  previous
                </button>
              )}
              
              {onNext && (
                <button
                  onClick={onNext}
                  className="zz-pill hover:bg-current hover:text-bg"
                >
                  next
                </button>
              )}
            </div>

            {/* Swipe Hint */}
            <div className="mt-4 text-center">
              <p className="zz-small opacity-40">
                ← swipe to navigate →
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
