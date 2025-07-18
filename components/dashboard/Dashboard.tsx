import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { DashboardTopBar } from './DashboardTopBar';
import { DashboardCard } from './DashboardCard';
import { ZaiChat } from './ZaiChat';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface DashboardProps {
  userData: OnboardingData;
  isDark: boolean;
  onReset: () => void;
  onThemeToggle: () => void;
}

const cardCategories = [
  'travel', 'food', 'devices', 'shopping', 
  'holidays', 'water', 'pets', 'rewards'
];

const categoryData = {
  travel: { title: 'travel', emoji: '🚗', color: 'var(--zz-accent)' },
  food: { title: 'food', emoji: '🥗', color: 'var(--zz-accent)' },
  devices: { title: 'devices', emoji: '📱', color: 'var(--zz-accent)' },
  shopping: { title: 'shopping', emoji: '🛍️', color: 'var(--zz-accent)' },
  holidays: { title: 'holidays', emoji: '✈️', color: 'var(--zz-accent)' },
  water: { title: 'water', emoji: '💧', color: 'var(--zz-accent)' },
  pets: { title: 'pets', emoji: '🐕', color: 'var(--zz-accent)' },
  rewards: { title: 'rewards', emoji: '🏆', color: 'var(--zz-accent)' }
};

export function Dashboard({ userData, isDark, onReset, onThemeToggle }: DashboardProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const currentCategory = cardCategories[currentCategoryIndex];
  const categoryInfo = categoryData[currentCategory];

  // Navigation functions
  const navigateUp = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      setCurrentCardIndex(0);
      setExpandedCard(null);
    }
  };

  const navigateDown = () => {
    if (currentCategoryIndex < cardCategories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentCardIndex(0);
      setExpandedCard(null);
    }
  };

  const navigateLeft = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setExpandedCard(null);
    }
  };

  const navigateRight = () => {
    if (currentCardIndex < 2) { // 3 cards per category (0, 1, 2)
      setCurrentCardIndex(prev => prev + 1);
      setExpandedCard(null);
    }
  };

  // Touch and swipe handling
  const handlePan = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal swipe
      if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
        navigateLeft();
      } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
        navigateRight();
      }
    } else {
      // Vertical swipe
      if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
        navigateUp();
      } else if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
        navigateDown();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (expandedCard) return; // Don't navigate when card is expanded

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateDown();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateRight();
          break;
        case 'Escape':
          if (expandedCard) {
            setExpandedCard(null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCategoryIndex, currentCardIndex, expandedCard]);

  const cardId = `${currentCategory}-${currentCardIndex}`;

  return (
    <div className="min-h-screen flex flex-col zz-dashboard" style={{ 
      background: 'var(--zz-bg)',
      color: 'var(--zz-text)',
      touchAction: 'none',
      userSelect: 'none'
    }}>
      {/* Top Bar */}
      <DashboardTopBar 
        userData={userData}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
        onReset={onReset}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
        
        {/* Up Navigation */}
        {currentCategoryIndex > 0 && !expandedCard && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.6, y: 0 }}
            whileHover={{ opacity: 1, y: -2 }}
            whileTap={{ opacity: 1, y: 0 }}
            onClick={navigateUp}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
            style={{
              background: 'transparent',
              border: '2px solid var(--zz-border)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              color: 'var(--zz-text)',
              fontSize: 'var(--text-medium)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ↑
          </motion.button>
        )}

        {/* Card Area */}
        <div className="flex-1 flex items-center justify-center w-full max-w-sm relative">
          
          {/* Left Navigation */}
          {currentCardIndex > 0 && !expandedCard && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.6, x: 0 }}
              whileHover={{ opacity: 1, x: -2 }}
              whileTap={{ opacity: 1, x: 0 }}
              onClick={navigateLeft}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20"
              style={{
                background: 'transparent',
                border: '2px solid var(--zz-border)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                color: 'var(--zz-text)',
                fontSize: 'var(--text-medium)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ←
            </motion.button>
          )}

          {/* Card */}
          <motion.div
            key={cardId}
            drag={!expandedCard}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            onPanEnd={handlePan}
            className="w-full max-w-sm"
            style={{ cursor: expandedCard ? 'default' : 'grab' }}
            whileDrag={{ cursor: 'grabbing' }}
          >
            <DashboardCard
              category={currentCategory}
              cardIndex={currentCardIndex}
              userData={userData}
              isDark={isDark}
              isExpanded={expandedCard === cardId}
              onExpand={() => setExpandedCard(expandedCard === cardId ? null : cardId)}
            />
          </motion.div>

          {/* Right Navigation */}
          {currentCardIndex < 2 && !expandedCard && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 0.6, x: 0 }}
              whileHover={{ opacity: 1, x: 2 }}
              whileTap={{ opacity: 1, x: 0 }}
              onClick={navigateRight}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20"
              style={{
                background: 'transparent',
                border: '2px solid var(--zz-border)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                color: 'var(--zz-text)',
                fontSize: 'var(--text-medium)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              →
            </motion.button>
          )}
        </div>

        {/* Down Navigation */}
        {currentCategoryIndex < cardCategories.length - 1 && !expandedCard && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.6, y: 0 }}
            whileHover={{ opacity: 1, y: 2 }}
            whileTap={{ opacity: 1, y: 0 }}
            onClick={navigateDown}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20"
            style={{
              background: 'transparent',
              border: '2px solid var(--zz-border)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              color: 'var(--zz-text)',
              fontSize: 'var(--text-medium)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ↓
          </motion.button>
        )}

        {/* Category Indicator */}
        {!expandedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            style={{
              fontSize: 'var(--text-small)',
              color: 'var(--zz-text)',
              textAlign: 'center',
              lineHeight: 1.3
            }}
          >
            {categoryInfo.title} {currentCardIndex + 1}/3
          </motion.div>
        )}
      </div>

      {/* Zai Chat */}
      <ZaiChat userData={userData} isDark={isDark} />
    </div>
  );
}