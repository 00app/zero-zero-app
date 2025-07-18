import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import aiService from '../../services/aiService';

interface DashboardCardProps {
  category: string;
  cardIndex: number;
  userData: OnboardingData;
  isDark: boolean;
  isExpanded: boolean;
  onExpand: () => void;
}

const generateCardData = (category: string, cardIndex: number, userData: OnboardingData) => {
  const cardId = `${category}-${cardIndex}`;
  
  // Enhanced card data with proper UK terminology and calculations
  const cardTemplates = {
    travel: [
      {
        title: 'public transport',
        carbonStat: '-2.3kg co₂/week',
        moneyStat: '£12 saved/week',
        waterStat: '15L saved/week',
        animalEquivalent: '2.5 trees protected',
        zaiTip: 'switching to bus/train 3x this week saves money and carbon. try the citymapper app for optimal routes.',
        action: {
          text: 'commit to 3 public transport trips this week?',
          points: 50,
          actionType: 'transport'
        }
      },
      {
        title: 'walking routes',
        carbonStat: '-1.1kg co₂/week',
        moneyStat: '£8 saved/week',
        waterStat: '8L saved/week',
        animalEquivalent: '1.2 trees protected',
        zaiTip: 'walking trips under 1 mile boost health and eliminate transport costs entirely.',
        input: {
          label: 'track your walking',
          placeholder: 'how many walking trips this week?'
        }
      },
      {
        title: 'cycle to work',
        carbonStat: '-4.2kg co₂/week',
        moneyStat: '£25 saved/week',
        waterStat: '28L saved/week',
        animalEquivalent: '4.5 trees protected',
        zaiTip: 'cycling replaces car journeys and improves fitness. cycle to work scheme saves 42% on bike costs.',
        externalLink: {
          text: 'find cycle routes near you',
          url: 'https://www.sustrans.org.uk/find-a-route'
        }
      }
    ],
    food: [
      {
        title: 'plant-based meals',
        carbonStat: '-1.8kg co₂/week',
        moneyStat: '£15 saved/week',
        waterStat: '120L saved/week',
        animalEquivalent: '0.8 cows helped',
        zaiTip: 'meat-free meals 3x per week reduce environmental impact by 40%. try bean-based recipes.',
        action: {
          text: 'try 3 meat-free meals this week?',
          points: 30,
          actionType: 'diet'
        }
      },
      {
        title: 'local produce',
        carbonStat: '-0.9kg co₂/week',
        moneyStat: '£6 saved/week',
        waterStat: '45L saved/week',
        animalEquivalent: '12 miles less trucking',
        zaiTip: 'local seasonal food reduces transport emissions and often costs less than imported options.',
        input: {
          label: 'local food tracker',
          placeholder: 'which local foods did you try?'
        }
      }
    ],
    // Add more categories with proper calculations...
  };

  const categoryCards = cardTemplates[category] || cardTemplates.travel;
  const cardData = categoryCards[cardIndex] || categoryCards[0];

  return {
    id: cardId,
    category,
    title: cardData.title,
    carbonStat: cardData.carbonStat,
    moneyStat: cardData.moneyStat,
    waterStat: cardData.waterStat,
    animalEquivalent: cardData.animalEquivalent,
    zaiTip: cardData.zaiTip,
    action: cardData.action,
    input: cardData.input,
    externalLink: cardData.externalLink
  };
};

export function DashboardCard({ 
  category, 
  cardIndex, 
  userData, 
  isDark, 
  isExpanded, 
  onExpand 
}: DashboardCardProps) {
  const [inputValue, setInputValue] = useState('');
  const [aiTip, setAiTip] = useState('');
  const [cardData, setCardData] = useState(() => generateCardData(category, cardIndex, userData));

  // Update card data when category or index changes
  useEffect(() => {
    setCardData(generateCardData(category, cardIndex, userData));
  }, [category, cardIndex, userData]);

  // Get AI tip when card is first loaded
  useEffect(() => {
    const getAiTip = async () => {
      try {
        const tip = await aiService.getZaiTip(userData);
        setAiTip(tip);
      } catch (error) {
        console.log('using default tip');
        setAiTip(cardData.zaiTip);
      }
    };
    
    getAiTip();
  }, [cardData.zaiTip, userData]);

  const handleAction = (accept: boolean) => {
    console.log(`Action ${accept ? 'accepted' : 'declined'} for card ${cardData.id}`);
    onExpand();
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      console.log(`Input submitted for card ${cardData.id}:`, inputValue);
      setInputValue('');
      onExpand();
    }
  };

  const handleExternalLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea')) {
      return;
    }
    onExpand();
  };

  return (
    <motion.div
      className="h-full w-full cursor-pointer"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div 
        className="h-full transition-all duration-300"
        style={{ 
          background: 'var(--zz-card)',
          borderRadius: '0',
          padding: '40px',
          minHeight: isExpanded ? '75vh' : '220px',
          width: '100%',
          minWidth: '75vw',
          maxWidth: '100%',
          maxHeight: isExpanded ? '90vh' : '220px',
          overflow: 'hidden',
          border: 'none'
        }}
        onClick={handleCardClick}
      >
        {/* Card Header - Fixed spacing to prevent overlap */}
        <div 
          className="flex items-start justify-between"
          style={{ 
            marginBottom: '32px',
            minHeight: '60px' // Ensure consistent header height
          }}
        >
          <div style={{ flex: 1, marginRight: '16px' }}>
            <div style={{ 
              fontSize: 'var(--text-small)',
              fontWeight: 'var(--font-regular)', 
              lineHeight: 1.2,
              fontFamily: 'Roboto, sans-serif',
              color: 'var(--zz-text)',
              opacity: 0.6,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}>
              {cardData.category}
            </div>
            <div style={{ 
              fontSize: 'var(--text-large)',
              fontWeight: 'var(--font-medium)', 
              lineHeight: 1.2,
              textTransform: 'lowercase',
              fontFamily: 'Roboto, sans-serif',
              color: 'var(--zz-text)'
            }}>
              {cardData.title}
            </div>
          </div>
          
          {/* Expand/Collapse Button - Fixed positioning */}
          <motion.div
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'transparent',
              color: 'var(--zz-text)',
              fontSize: '24px',
              fontWeight: 'var(--font-medium)',
              lineHeight: 1,
              fontFamily: 'Roboto, sans-serif',
              border: 'none',
              flexShrink: 0 // Prevent shrinking
            }}
            animate={{ scale: isExpanded ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            whileHover={{ 
              background: 'var(--zz-accent)',
              color: 'var(--zz-bg)',
              scale: 1.2 
            }}
            whileTap={{ scale: 0.9 }}
          >
            {isExpanded ? '−' : '+'}
          </motion.div>
        </div>

        {/* Collapsed View - Fixed layout to prevent overlap */}
        {!isExpanded && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ minHeight: '120px' }} // Ensure consistent height
          >
            {/* Primary Stat - Carbon */}
            {cardData.carbonStat && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: 'var(--text-small)',
                  fontWeight: 'var(--font-regular)', 
                  lineHeight: 1.2,
                  fontFamily: 'Roboto, sans-serif',
                  color: 'var(--zz-text)',
                  opacity: 0.6,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '12px'
                }}>
                  carbon impact
                </div>
                <div style={{ 
                  fontSize: '48px',
                  fontWeight: '900',
                  lineHeight: 1,
                  fontFamily: 'Roboto, sans-serif',
                  color: 'var(--zz-text)'
                }}>
                  {cardData.carbonStat}
                </div>
              </div>
            )}
            
            {/* Secondary Stat - Money */}
            {cardData.moneyStat && (
              <div>
                <div style={{ 
                  fontSize: 'var(--text-small)',
                  fontWeight: 'var(--font-regular)', 
                  lineHeight: 1.2,
                  fontFamily: 'Roboto, sans-serif',
                  color: 'var(--zz-text)',
                  opacity: 0.6,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  cost savings
                </div>
                <div style={{ 
                  fontSize: '32px',
                  fontWeight: 'var(--font-medium)',
                  lineHeight: 1,
                  fontFamily: 'Roboto, sans-serif',
                  color: 'var(--zz-text)'
                }}>
                  {cardData.moneyStat}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Expanded View - Proper spacing to prevent overlap */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ 
                maxHeight: '60vh',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Stats Grid - Fixed spacing */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '24px',
                marginBottom: '32px'
              }}>
                {cardData.carbonStat && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ 
                      fontSize: 'var(--text-small)',
                      lineHeight: 1.2,
                      textTransform: 'lowercase',
                      opacity: 0.6,
                      marginBottom: '8px'
                    }}>
                      carbon footprint
                    </div>
                    <div style={{ 
                      fontSize: '36px',
                      fontWeight: 'var(--font-medium)', 
                      lineHeight: 1.2 
                    }}>
                      {cardData.carbonStat}
                    </div>
                  </div>
                )}
                
                {cardData.moneyStat && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ 
                      fontSize: 'var(--text-small)',
                      lineHeight: 1.2,
                      textTransform: 'lowercase',
                      opacity: 0.6,
                      marginBottom: '8px'
                    }}>
                      cost impact
                    </div>
                    <div style={{ 
                      fontSize: '36px',
                      fontWeight: 'var(--font-medium)', 
                      lineHeight: 1.2 
                    }}>
                      {cardData.moneyStat}
                    </div>
                  </div>
                )}
                
                {cardData.animalEquivalent && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ 
                      fontSize: 'var(--text-small)',
                      lineHeight: 1.2,
                      textTransform: 'lowercase',
                      opacity: 0.6,
                      marginBottom: '8px'
                    }}>
                      environmental impact
                    </div>
                    <div style={{ 
                      fontSize: '36px',
                      fontWeight: 'var(--font-medium)', 
                      lineHeight: 1.2 
                    }}>
                      {cardData.animalEquivalent}
                    </div>
                  </div>
                )}
              </div>

              {/* Zai AI Tip - Fixed spacing */}
              <div style={{ 
                marginBottom: '32px',
                padding: '16px 0'
              }}>
                <div style={{ 
                  fontSize: 'var(--text-small)',
                  lineHeight: 1.2,
                  textTransform: 'lowercase',
                  opacity: 0.6,
                  marginBottom: '16px'
                }}>
                  zai says
                </div>
                <div style={{ 
                  fontSize: 'var(--text-medium)',
                  lineHeight: 1.4 
                }}>
                  {aiTip || cardData.zaiTip}
                </div>
              </div>

              {/* Action Buttons - Fixed spacing, no overlap */}
              {cardData.action && (
                <div style={{ 
                  marginBottom: '32px',
                  padding: '16px 0'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: 'var(--text-medium)',
                      lineHeight: 1.4,
                      marginBottom: '24px'
                    }}>
                      {cardData.action.text}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: '24px',
                      marginBottom: '16px'
                    }}>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(true);
                        }}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: 'transparent',
                          color: 'var(--zz-text)',
                          border: 'none',
                          fontSize: 'var(--text-large)',
                          lineHeight: 1,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        whileHover={{ 
                          background: 'var(--zz-accent)',
                          color: 'var(--zz-bg)',
                          scale: 1.05 
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✓
                      </motion.button>
                      
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(false);
                        }}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: 'transparent',
                          color: 'var(--zz-text)',
                          border: 'none',
                          fontSize: 'var(--text-large)',
                          lineHeight: 1,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        whileHover={{ 
                          background: 'var(--zz-accent)',
                          color: 'var(--zz-bg)',
                          scale: 1.05 
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ×
                      </motion.button>
                    </div>
                    
                    <div style={{ 
                      fontSize: 'var(--text-small)',
                      opacity: 0.8,
                      lineHeight: 1.2 
                    }}>
                      earn {cardData.action.points} pts
                    </div>
                  </div>
                </div>
              )}

              {/* Input Field - Fixed spacing */}
              {cardData.input && (
                <div style={{ 
                  marginBottom: '32px',
                  padding: '16px 0'
                }}>
                  <div style={{ 
                    fontSize: 'var(--text-small)',
                    lineHeight: 1.2,
                    textTransform: 'lowercase',
                    opacity: 0.6,
                    marginBottom: '16px'
                  }}>
                    {cardData.input.label}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={cardData.input.placeholder}
                      style={{ 
                        flex: 1,
                        padding: '12px 16px',
                        background: 'transparent',
                        color: 'var(--zz-text)',
                        fontSize: 'var(--text-medium)',
                        lineHeight: 1.2,
                        border: 'none',
                        outline: 'none'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInputSubmit();
                      }}
                      style={{ 
                        padding: '12px 24px',
                        background: 'transparent',
                        color: 'var(--zz-text)',
                        fontSize: 'var(--text-medium)',
                        lineHeight: 1.2,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      whileHover={{ 
                        background: 'var(--zz-accent)',
                        color: 'var(--zz-bg)'
                      }}
                      disabled={!inputValue.trim()}
                    >
                      save
                    </motion.button>
                  </div>
                </div>
              )}

              {/* External Link - Fixed spacing */}
              {cardData.externalLink && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExternalLinkClick(cardData.externalLink!.url);
                  }}
                  style={{ 
                    width: '100%',
                    padding: '16px',
                    background: 'transparent',
                    color: 'var(--zz-text)',
                    fontSize: 'var(--text-medium)',
                    lineHeight: 1.2,
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '16px'
                  }}
                  whileHover={{ 
                    background: 'var(--zz-accent)',
                    color: 'var(--zz-bg)',
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cardData.externalLink.text} →
                </motion.button>
              )}

              {/* Close Button - Fixed positioning */}
              <div style={{ 
                textAlign: 'center', 
                paddingTop: '24px',
                borderTop: '1px solid var(--zz-border)'
              }}>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand();
                  }}
                  style={{
                    fontSize: 'var(--text-small)',
                    opacity: 0.6,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--zz-text)',
                    lineHeight: 1.2,
                    padding: '16px',
                    cursor: 'pointer'
                  }}
                  whileHover={{ 
                    opacity: 1,
                    scale: 1.05 
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  tap to collapse
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}