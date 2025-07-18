import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { DashboardTopBar } from './DashboardTopBar';
import { DashboardCard } from './DashboardCard';
import { ZaiChat } from './ZaiChat';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import aiService from '../../services/aiService';
import googleMapsService from '../../services/googleMapsService';

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
  travel: { title: 'travel', color: 'var(--zz-accent)' },
  food: { title: 'food', color: 'var(--zz-accent)' },
  devices: { title: 'devices', color: 'var(--zz-accent)' },
  shopping: { title: 'shopping', color: 'var(--zz-accent)' },
  holidays: { title: 'holidays', color: 'var(--zz-accent)' },
  water: { title: 'water', color: 'var(--zz-accent)' },
  pets: { title: 'pets', color: 'var(--zz-accent)' },
  rewards: { title: 'rewards', color: 'var(--zz-accent)' }
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

  // Touch and swipe handling for mobile
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
    <div 
      className="min-h-screen w-full flex flex-col zz-dashboard" 
      style={{ 
        background: 'var(--zz-bg)',
        color: 'var(--zz-text)',
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      {/* Top Bar */}
      <DashboardTopBar 
        userData={userData}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
        onReset={onReset}
      />

      {/* Main Content Container - Centered and Full Width */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        
        {/* Up Navigation Arrow */}
        {currentCategoryIndex > 0 && !expandedCard && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
              background: 'var(--zz-accent)',
              color: 'var(--zz-bg)',
              y: -2, 
              scale: 1.1 
            }}
            whileTap={{ scale: 0.9 }}
            onClick={navigateUp}
            className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
            style={{
              background: 'transparent',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              color: 'var(--zz-text)',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Roboto, sans-serif',
              lineHeight: 1,
              border: 'none'
            }}
          >
            ↑
          </motion.button>
        )}

        {/* Navigation and Card Layout */}
        <div className="w-full h-full flex items-center justify-center gap-2">
          
          {/* Left Navigation Arrow - Outside Card */}
          <div className="flex items-center" style={{ padding: '5px' }}>
            {currentCardIndex > 0 && !expandedCard ? (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ 
                  background: 'var(--zz-accent)',
                  color: 'var(--zz-bg)',
                  x: -2, 
                  scale: 1.1 
                }}
                whileTap={{ scale: 0.9 }}
                onClick={navigateLeft}
                style={{
                  background: 'transparent',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  color: 'var(--zz-text)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Roboto, sans-serif',
                  lineHeight: 1,
                  border: 'none'
                }}
              >
                ←
              </motion.button>
            ) : (
              <div style={{ width: '48px', height: '48px' }} />
            )}
          </div>

          {/* Main Card Container - Centered */}
          <div className="flex-1 flex justify-center">
            <motion.div
              key={cardId}
              drag={!expandedCard}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.1}
              onPanEnd={handlePan}
              className="w-full flex justify-center"
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
          </div>

          {/* Right Navigation Arrow - Outside Card */}
          <div className="flex items-center" style={{ padding: '5px' }}>
            {currentCardIndex < 2 && !expandedCard ? (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ 
                  background: 'var(--zz-accent)',
                  color: 'var(--zz-bg)',
                  x: 2, 
                  scale: 1.1 
                }}
                whileTap={{ scale: 0.9 }}
                onClick={navigateRight}
                style={{
                  background: 'transparent',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  color: 'var(--zz-text)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Roboto, sans-serif',
                  lineHeight: 1,
                  border: 'none'
                }}
              >
                →
              </motion.button>
            ) : (
              <div style={{ width: '48px', height: '48px' }} />
            )}
          </div>
        </div>

        {/* Down Navigation Arrow */}
        {currentCategoryIndex < cardCategories.length - 1 && !expandedCard && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
              background: 'var(--zz-accent)',
              color: 'var(--zz-bg)',
              y: 2, 
              scale: 1.1 
            }}
            whileTap={{ scale: 0.9 }}
            onClick={navigateDown}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            style={{
              background: 'transparent',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              color: 'var(--zz-text)',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Roboto, sans-serif',
              lineHeight: 1,
              border: 'none'
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