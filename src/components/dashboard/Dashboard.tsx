import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import { DashboardCard } from './DashboardCard';

interface DashboardProps {
  userData: OnboardingData;
  isDark?: boolean;
  onReset: () => void;
  onThemeToggle?: () => void;
}

const cardCategories = [
  'transport',
  'food', 
  'energy',
  'water',
  'waste',
  'shopping',
  'home',
  'community'
];

export function Dashboard({ userData, isDark = true, onReset, onThemeToggle }: DashboardProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    carbonSaved: 0,
    moneySaved: 0,
    actionsCompleted: 0,
    streakDays: 0
  });
  const [showZaiChat, setShowZaiChat] = useState(false);

  // Load user stats from Supabase
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const { getUserRewards } = await import('../../../services/supabase');
        const rewards = await getUserRewards('current-user-id');
        
        if (rewards) {
          setUserStats({
            totalPoints: rewards.total_points,
            carbonSaved: rewards.carbon_saved_kg,
            moneySaved: rewards.money_saved_pounds,
            actionsCompleted: rewards.actions_completed,
            streakDays: rewards.streak_days
          });
          console.log('user stats loaded:', rewards);
        }
      } catch (error) {
        console.log('using mock stats data:', error);
        setUserStats({
          totalPoints: 247,
          carbonSaved: 24,
          moneySaved: 156,
          actionsCompleted: 18,
          streakDays: 7
        });
      }
    };

    loadUserStats();
  }, []);

  const handleCardExpand = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const nextCard = () => {
    if (!expandedCard) {
      setCurrentCardIndex((prev) => (prev + 1) % cardCategories.length);
    }
  };

  const prevCard = () => {
    if (!expandedCard) {
      setCurrentCardIndex((prev) => (prev - 1 + cardCategories.length) % cardCategories.length);
    }
  };

  return (
    <div 
      style={{ 
        background: 'var(--zz-bg)', 
        color: 'var(--zz-text)',
        fontFamily: 'Roboto, sans-serif',
        minHeight: '100vh',
        fontWeight: '400',
        fontSize: '16px',
        lineHeight: 1.4,
        textTransform: 'lowercase',
        padding: '24px'
      }}
    >
      {/* Header */}
      <header 
        style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '48px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div className="zz-dashboard-medium" style={{ marginBottom: '8px' }}>
            hello {userData.name}
          </div>
          <div className="zz-dashboard-label">
            {userData.postcode} • {userData.homeType} • {userData.people} people
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onThemeToggle}
            style={{ 
              width: '48px', 
              height: '48px',
              fontSize: '16px',
              background: 'transparent',
              color: 'var(--zz-text)',
              border: '2px solid var(--zz-border)',
              cursor: 'pointer',
              transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isDark ? '☀' : '●'}
          </button>

          <button
            onClick={onReset}
            style={{ 
              width: '48px', 
              height: '48px',
              fontSize: '16px',
              background: 'transparent',
              color: 'var(--zz-text)',
              border: '2px solid var(--zz-border)',
              cursor: 'pointer',
              transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div 
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '48px'
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div className="zz-dashboard-big">
            {userStats.carbonSaved}
          </div>
          <div className="zz-dashboard-label">
            kg co₂ saved
          </div>
        </div>
        
        <div style={{ textAlign: 'left' }}>
          <div className="zz-dashboard-big">
            £{userStats.moneySaved}
          </div>
          <div className="zz-dashboard-label">
            money saved
          </div>
        </div>
        
        <div style={{ textAlign: 'left' }}>
          <div className="zz-dashboard-big">
            {userStats.actionsCompleted}
          </div>
          <div className="zz-dashboard-label">
            actions taken
          </div>
        </div>
        
        <div style={{ textAlign: 'left' }}>
          <div className="zz-dashboard-big">
            {userStats.streakDays}
          </div>
          <div className="zz-dashboard-label">
            day streak
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div 
        style={{ 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: expandedCard ? '80vh' : '400px',
          marginBottom: '48px'
        }}
      >
        {/* Navigation Buttons - Hidden when expanded */}
        {!expandedCard && (
          <>
            <button
              onClick={prevCard}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 30,
                width: '48px',
                height: '48px',
                background: 'var(--zz-card)',
                border: '2px solid var(--zz-border)',
                color: 'var(--zz-text)',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--zz-accent)';
                e.currentTarget.style.color = 'var(--zz-bg)';
                e.currentTarget.style.transform = 'translateY(-50%) translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--zz-card)';
                e.currentTarget.style.color = 'var(--zz-text)';
                e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
              }}
            >
              ←
            </button>

            <button
              onClick={nextCard}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 30,
                width: '48px',
                height: '48px',
                background: 'var(--zz-card)',
                border: '2px solid var(--zz-border)',
                color: 'var(--zz-text)',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--zz-accent)';
                e.currentTarget.style.color = 'var(--zz-bg)';
                e.currentTarget.style.transform = 'translateY(-50%) translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--zz-card)';
                e.currentTarget.style.color = 'var(--zz-text)';
                e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
              }}
            >
              →
            </button>
          </>
        )}

        {/* Card */}
        <div 
          style={{ 
            width: '100%',
            maxWidth: expandedCard ? '800px' : '360px',
            transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cardCategories[currentCardIndex]}-${currentCardIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <DashboardCard
                category={cardCategories[currentCardIndex]}
                cardIndex={currentCardIndex}
                userData={userData}
                isDark={isDark}
                isExpanded={expandedCard === `${cardCategories[currentCardIndex]}-${currentCardIndex}`}
                onExpand={() => handleCardExpand(`${cardCategories[currentCardIndex]}-${currentCardIndex}`)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Card Indicator - Hidden when expanded */}
      {!expandedCard && (
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '32px'
          }}
        >
          {cardCategories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCardIndex(index)}
              style={{
                width: '8px',
                height: '8px',
                background: index === currentCardIndex ? 'var(--zz-accent)' : 'var(--zz-border)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: index === currentCardIndex ? 1 : 0.5
              }}
            />
          ))}
        </div>
      )}

      {/* Category Title - Hidden when expanded */}
      {!expandedCard && (
        <div 
          className="zz-dashboard-medium"
          style={{ 
            textAlign: 'center',
            marginBottom: '48px'
          }}
        >
          {cardCategories[currentCardIndex]}
        </div>
      )}

      {/* Chat Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => setShowZaiChat(true)}
          style={{
            background: 'transparent',
            color: 'var(--zz-text)',
            border: '2px solid var(--zz-border)',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
            textTransform: 'lowercase',
            fontFamily: 'Roboto, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--zz-accent)';
            e.currentTarget.style.color = 'var(--zz-bg)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--zz-text)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ask zai
        </button>
      </div>

      {/* Zai Chat Modal */}
      <AnimatePresence>
        {showZaiChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--zz-black)',
              backdropFilter: 'none'
            }}
            onClick={() => setShowZaiChat(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--zz-bg)',
                border: '2px solid var(--zz-border)',
                padding: '32px',
                width: '90vw',
                maxWidth: '600px',
                maxHeight: '80vh',
                fontFamily: 'Roboto, sans-serif'
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '32px' 
                }}
              >
                <div className="zz-dashboard-medium">
                  zai assistant
                </div>
                
                <button
                  onClick={() => setShowZaiChat(false)}
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    fontSize: '16px',
                    background: 'transparent',
                    color: 'var(--zz-text)',
                    border: '2px solid var(--zz-border)',
                    cursor: 'pointer',
                    transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              <div 
                style={{ 
                  height: '400px',
                  border: '2px solid var(--zz-border)',
                  padding: '24px',
                  marginBottom: '24px',
                  fontSize: '16px',
                  lineHeight: 1.4,
                  overflow: 'auto',
                  textAlign: 'left',
                  textTransform: 'lowercase',
                  background: 'var(--zz-card)',
                  color: 'var(--zz-card-text)'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  hello {userData.name}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  i can help with sustainability tips for your {userData.homeType} in {userData.postcode}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  household size: {userData.people} people
                </div>
                <div style={{ marginBottom: '16px' }}>
                  transport: {userData.transportMode}
                </div>
                <div>
                  chat feature coming soon. for now, explore the cards above for personalized sustainability actions.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="ask about sustainability..."
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'transparent',
                    border: '2px solid var(--zz-border)',
                    color: 'var(--zz-text)',
                    fontSize: '16px',
                    outline: 'none',
                    textTransform: 'lowercase',
                    fontFamily: 'Roboto, sans-serif'
                  }}
                  disabled
                />
                <button
                  style={{
                    padding: '16px 24px',
                    background: 'transparent',
                    border: '2px solid var(--zz-border)',
                    color: 'var(--zz-text)',
                    fontSize: '16px',
                    cursor: 'not-allowed',
                    opacity: 0.5,
                    textTransform: 'lowercase',
                    fontFamily: 'Roboto, sans-serif'
                  }}
                  disabled
                >
                  send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}