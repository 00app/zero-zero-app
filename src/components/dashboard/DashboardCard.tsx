import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface DashboardCardProps {
  category: string;
  cardIndex: number;
  userData: OnboardingData;
  isDark?: boolean;
  isExpanded: boolean;
  onExpand: () => void;
}

interface CardData {
  id: string;
  title: string;
  impact: string;
  animalEquivalent: string;
  ctaText: string;
  tags: string[];
  explanation: string;
  inputType: 'number' | 'select' | 'text' | 'range';
  inputLabel: string;
  inputPlaceholder?: string;
  inputOptions?: string[];
  carbonValue: number;
  moneyValue: number;
  waterValue?: number;
}

const cardDatabase: Record<string, CardData> = {
  transport: {
    id: 'transport_public_transport',
    title: 'switch to public transport',
    impact: '54kg co₂ saved annually',
    animalEquivalent: '3 penguins of co₂ saved',
    ctaText: 'switch now',
    tags: ['transport', 'money', 'local'],
    explanation: 'taking the bus or train instead of driving just 2 days per week can save 54kg of co₂ emissions annually and £280 in fuel costs. public transport also reduces traffic congestion and supports your local community.',
    inputType: 'number',
    inputLabel: 'how many days per week will you use public transport',
    inputPlaceholder: 'e.g. 3',
    carbonValue: 2.3,
    moneyValue: 5.50,
    waterValue: 0
  },
  
  food: {
    id: 'food_plant_based',
    title: 'eat more plant-based meals',
    impact: '40% carbon reduction',
    animalEquivalent: '2 polar bears of co₂ saved',
    ctaText: 'start eating',
    tags: ['food', 'health', 'money'],
    explanation: 'replacing meat with plant-based proteins 3 times per week reduces your food carbon footprint by 40%, saves 2,100 litres of water weekly, and cuts grocery costs by £15 per week.',
    inputType: 'select',
    inputLabel: 'how many plant-based meals per week',
    inputOptions: ['1-2 meals', '3-4 meals', '5-6 meals', '7+ meals'],
    carbonValue: 1.8,
    moneyValue: 3.20,
    waterValue: 300
  },
  
  energy: {
    id: 'energy_led_bulbs',
    title: 'switch to led lighting',
    impact: '80% less energy usage',
    animalEquivalent: '1 elephant of co₂ saved',
    ctaText: 'switch now',
    tags: ['energy', 'money', 'home'],
    explanation: 'led bulbs use 80% less energy than traditional incandescent bulbs and last 25 times longer. switching all bulbs in your home saves 2,400 kwh yearly - thats £600 off your energy bill.',
    inputType: 'number',
    inputLabel: 'how many bulbs will you replace',
    inputPlaceholder: 'e.g. 8',
    carbonValue: 0.8,
    moneyValue: 12.50,
    waterValue: 0
  },
  
  water: {
    id: 'water_shorter_showers',
    title: 'take shorter showers',
    impact: '15,000l water saved yearly',
    animalEquivalent: '1 whale of water saved',
    ctaText: 'start saving',
    tags: ['water', 'money', 'home'],
    explanation: 'reducing shower time from 10 to 4 minutes saves 15,000 litres of water annually and £180 on water bills. a simple timer can help you track your progress.',
    inputType: 'range',
    inputLabel: 'target shower time (minutes)',
    carbonValue: 0.3,
    moneyValue: 2.10,
    waterValue: 500
  },
  
  waste: {
    id: 'waste_composting',
    title: 'start composting food scraps',
    impact: '30% less household waste',
    animalEquivalent: '1 panda of waste reduced',
    ctaText: 'start composting',
    tags: ['waste', 'home', 'local'],
    explanation: 'composting food scraps reduces household waste by 30% and creates nutrient-rich soil for plants. it also reduces methane emissions from landfills.',
    inputType: 'select',
    inputLabel: 'what will you compost',
    inputOptions: ['fruit & veg scraps', 'all food waste', 'garden waste too', 'everything possible'],
    carbonValue: 1.2,
    moneyValue: 0,
    waterValue: 0
  },
  
  shopping: {
    id: 'shopping_second_hand',
    title: 'buy second-hand clothing',
    impact: '60% less fashion impact',
    animalEquivalent: '2 koalas of co₂ saved',
    ctaText: 'shop second-hand',
    tags: ['shopping', 'money', 'local'],
    explanation: 'buying second-hand clothes reduces fashion industry impact by 60% and saves an average of £40 per item. charity shops and vintage stores offer unique finds.',
    inputType: 'number',
    inputLabel: 'how many second-hand items per month',
    inputPlaceholder: 'e.g. 2',
    carbonValue: 3.2,
    moneyValue: 40,
    waterValue: 800
  },
  
  home: {
    id: 'home_thermostat',
    title: 'lower thermostat by 1°c',
    impact: '10% heating cost reduction',
    animalEquivalent: '1 seal of co₂ saved',
    ctaText: 'adjust now',
    tags: ['home', 'money', 'energy'],
    explanation: 'reducing your thermostat by just 1°c can cut heating costs by 10% and save 300kg co₂ annually. wearing layers indoors makes this barely noticeable.',
    inputType: 'range',
    inputLabel: 'new thermostat setting (°c)',
    carbonValue: 2.1,
    moneyValue: 15.80,
    waterValue: 0
  },
  
  community: {
    id: 'community_local_produce',
    title: 'buy local seasonal produce',
    impact: '70% less food miles',
    animalEquivalent: '1 penguin of co₂ saved',
    ctaText: 'shop local',
    tags: ['community', 'food', 'local'],
    explanation: 'buying seasonal produce from local farmers reduces food miles by 70%, supports your community economy, and often costs less than supermarket imports.',
    inputType: 'select',
    inputLabel: 'how often will you shop locally',
    inputOptions: ['once per month', 'twice per month', 'weekly', 'most shopping'],
    carbonValue: 1.5,
    moneyValue: 8.20,
    waterValue: 200
  }
};

export function DashboardCard({ category, cardIndex, userData, isDark = true, isExpanded, onExpand }: DashboardCardProps) {
  const [inputValue, setInputValue] = useState<string | number>('');
  const [actionStatus, setActionStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [impactFeedback, setImpactFeedback] = useState<{ carbon: number; money: number; emoji: string } | null>(null);
  
  const cardData = cardDatabase[category] || cardDatabase.transport;

  // Calculate personalized impact based on user data
  const calculatePersonalizedImpact = () => {
    let multiplier = 1;
    
    // Adjust based on household size
    if (userData.people) {
      multiplier *= userData.people * 0.3 + 0.7;
    }
    
    // Adjust based on transport mode for travel cards
    if (category === 'transport' && userData.transportMode === 'car') {
      multiplier *= 1.5;
    }
    
    // Adjust based on home type for energy/water cards
    if ((category === 'energy' || category === 'water') && userData.homeType === 'house') {
      multiplier *= 1.3;
    }
    
    return {
      carbon: Math.round(cardData.carbonValue * multiplier * 10) / 10,
      money: Math.round(cardData.moneyValue * multiplier),
      water: cardData.waterValue ? Math.round(cardData.waterValue * multiplier) : 0
    };
  };

  const personalizedImpact = calculatePersonalizedImpact();

  const handleInputChange = (value: string | number) => {
    setInputValue(value);
    
    let inputMultiplier = 1;
    
    if (typeof value === 'number') {
      inputMultiplier = value;
    } else if (cardData.inputOptions && typeof value === 'string') {
      const optionIndex = cardData.inputOptions.indexOf(value);
      inputMultiplier = (optionIndex + 1) * 0.5 + 0.5;
    }
    
    const feedback = {
      carbon: Math.round(personalizedImpact.carbon * inputMultiplier * 10) / 10,
      money: Math.round(personalizedImpact.money * inputMultiplier),
      emoji: getFeedbackEmoji(inputMultiplier)
    };
    
    setImpactFeedback(feedback);
  };

  const getFeedbackEmoji = (multiplier: number): string => {
    if (multiplier >= 3) return '★';
    if (multiplier >= 2) return '✓';
    if (multiplier >= 1) return '+';
    return '→';
  };

  const saveAction = async (actionType: 'accept' | 'complete' | 'save_later') => {
    setActionStatus('saving');
    
    try {
      const { logCardInteraction } = await import('../../../services/supabase');
      
      const actionData = {
        user_id: 'current-user-id',
        card_id: cardData.id,
        card_category: category,
        action_taken: actionType === 'complete' ? 'accept' : actionType === 'save_later' ? 'input_submitted' : 'accept',
        action_data: {
          input_value: inputValue,
          input_type: cardData.inputType,
          input_label: cardData.inputLabel,
          impact_feedback: impactFeedback,
          user_context: {
            postcode: userData.postcode,
            transport_mode: userData.transportMode,
            home_type: userData.homeType,
            people: userData.people,
            rooms: userData.rooms
          }
        },
        points_earned: actionType === 'complete' ? 15 : actionType === 'accept' ? 10 : 5,
        carbon_saved: impactFeedback?.carbon || personalizedImpact.carbon,
        money_saved: impactFeedback?.money || personalizedImpact.money
      };

      console.log('saving action:', actionData);
      const result = await logCardInteraction(actionData);
      
      if (result) {
        console.log('action saved successfully:', result);
        setActionStatus('saved');
        setTimeout(() => setActionStatus('idle'), 2000);
      } else {
        console.warn('action save returned null');
        setActionStatus('error');
        setTimeout(() => setActionStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('error saving action:', error);
      setActionStatus('error');
      setTimeout(() => setActionStatus('idle'), 2000);
    }
  };

  const renderInput = () => {
    const baseInputStyle = {
      width: '100%',
      padding: '16px',
      background: 'transparent',
      border: 'none',
      borderBottom: '2px solid var(--zz-border)',
      color: 'var(--zz-text)',
      fontSize: '16px',
      fontWeight: '400',
      outline: 'none',
      textTransform: 'lowercase' as const,
      fontFamily: 'Roboto, sans-serif'
    };

    switch (cardData.inputType) {
      case 'number':
        return (
          <input
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(parseInt(e.target.value) || 0)}
            placeholder={cardData.inputPlaceholder}
            min="0"
            max="50"
            style={baseInputStyle}
          />
        );
      
      case 'select':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cardData.inputOptions?.map((option) => (
              <button
                key={option}
                onClick={() => handleInputChange(option)}
                style={{
                  padding: '16px',
                  background: inputValue === option ? 'var(--zz-accent)' : 'transparent',
                  color: inputValue === option ? 'var(--zz-bg)' : 'var(--zz-text)',
                  border: '2px solid var(--zz-border)',
                  borderColor: inputValue === option ? 'var(--zz-accent)' : 'var(--zz-border)',
                  fontSize: '16px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                  textTransform: 'lowercase',
                  fontFamily: 'Roboto, sans-serif',
                  width: '100%'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        );
      
      case 'range':
        const rangeValue = typeof inputValue === 'number' ? inputValue : 
          cardData.inputLabel.includes('thermostat') ? 20 : 5;
        const min = cardData.inputLabel.includes('thermostat') ? 16 : 2;
        const max = cardData.inputLabel.includes('thermostat') ? 24 : 20;
        
        return (
          <div>
            <div 
              className="zz-dashboard-small"
              style={{ 
                textAlign: 'center',
                marginBottom: '16px'
              }}
            >
              {rangeValue}{cardData.inputLabel.includes('thermostat') ? '°c' : ' min'}
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={rangeValue}
              onChange={(e) => handleInputChange(parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '4px',
                background: 'var(--zz-border)',
                outline: 'none',
                appearance: 'none'
              }}
            />
          </div>
        );
      
      case 'text':
        return (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={cardData.inputPlaceholder}
            style={baseInputStyle}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      style={{
        background: 'var(--zz-card)',
        color: 'var(--zz-card-text)',
        border: '2px solid var(--zz-border)',
        borderColor: isExpanded ? 'var(--zz-accent)' : 'var(--zz-border)',
        padding: '24px',
        width: '100%',
        minHeight: isExpanded ? '600px' : '280px',
        maxWidth: isExpanded ? '800px' : '360px',
        cursor: isExpanded ? 'default' : 'pointer',
        transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        textAlign: 'left',
        fontFamily: 'Roboto, sans-serif',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: 1.4,
        textTransform: 'lowercase'
      }}
      onClick={!isExpanded ? onExpand : undefined}
      whileHover={!isExpanded ? { transform: 'translateY(-2px)' } : {}}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // Collapsed State
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {/* Title */}
            <h3 className="zz-dashboard-small" style={{ marginBottom: '16px' }}>
              {cardData.title}
            </h3>

            {/* Impact */}
            <div style={{ 
              fontSize: '16px',
              marginBottom: '8px',
              opacity: 0.8,
              textTransform: 'lowercase'
            }}>
              {cardData.impact}
            </div>

            {/* Animal Equivalent */}
            <div style={{ 
              fontSize: '12px',
              marginBottom: '24px',
              opacity: 0.6,
              textTransform: 'lowercase'
            }}>
              {cardData.animalEquivalent}
            </div>

            {/* Tags */}
            <div style={{ 
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              {cardData.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '12px',
                    opacity: 0.6,
                    textTransform: 'lowercase'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <div style={{ marginTop: 'auto' }}>
              <button
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
                  width: '100%',
                  fontFamily: 'Roboto, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--zz-accent)';
                  e.currentTarget.style.color = 'var(--zz-bg)';
                  e.currentTarget.style.borderColor = 'var(--zz-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--zz-text)';
                  e.currentTarget.style.borderColor = 'var(--zz-border)';
                }}
              >
                {cardData.ctaText}
              </button>
            </div>
          </motion.div>
        ) : (
          // Expanded State
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 className="zz-dashboard-small" style={{ marginBottom: '8px' }}>
                  {cardData.title}
                </h3>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  {cardData.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '12px',
                        opacity: 0.6,
                        textTransform: 'lowercase'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                onClick={onExpand}
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'transparent',
                  border: '2px solid var(--zz-border)',
                  color: 'var(--zz-text)',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                ×
              </button>
            </div>

            {/* Explanation */}
            <div style={{ 
              fontSize: '16px',
              lineHeight: 1.4,
              opacity: 0.8,
              textTransform: 'lowercase'
            }}>
              {cardData.explanation}
            </div>

            {/* Input Section */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '16px',
                textTransform: 'lowercase'
              }}>
                {cardData.inputLabel}
              </label>
              {renderInput()}
            </div>

            {/* Impact Feedback */}
            {impactFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'var(--zz-bg)',
                  border: '2px solid var(--zz-accent)',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {impactFeedback.emoji}
                </div>
                <div className="zz-dashboard-label" style={{ marginBottom: '8px' }}>
                  your impact: {impactFeedback.carbon}kg co₂ + £{impactFeedback.money} saved
                </div>
                <div style={{ 
                  fontSize: '12px',
                  opacity: 0.6,
                  textTransform: 'lowercase'
                }}>
                  based on your household of {userData.people} people
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
              <button
                onClick={() => saveAction('complete')}
                disabled={actionStatus === 'saving'}
                style={{
                  flex: 1,
                  background: actionStatus === 'saved' ? 'var(--zz-accent)' : 'transparent',
                  color: actionStatus === 'saved' ? 'var(--zz-bg)' : 'var(--zz-text)',
                  border: '2px solid var(--zz-border)',
                  borderColor: actionStatus === 'saved' ? 'var(--zz-accent)' : 'var(--zz-border)',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '400',
                  cursor: actionStatus === 'saving' ? 'not-allowed' : 'pointer',
                  opacity: actionStatus === 'saving' ? 0.5 : 1,
                  transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                  textTransform: 'lowercase',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                {actionStatus === 'saving' ? 'saving...' : 
                 actionStatus === 'saved' ? '✓ marked complete' : 
                 'mark complete'}
              </button>
              
              <button
                onClick={() => saveAction('save_later')}
                disabled={actionStatus === 'saving'}
                style={{
                  background: 'transparent',
                  color: 'var(--zz-text)',
                  border: '2px solid var(--zz-border)',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '400',
                  cursor: actionStatus === 'saving' ? 'not-allowed' : 'pointer',
                  opacity: actionStatus === 'saving' ? 0.5 : 1,
                  transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                  textTransform: 'lowercase',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                save later
              </button>
            </div>

            {/* Status Messages */}
            {actionStatus === 'error' && (
              <div style={{ 
                fontSize: '12px',
                color: 'var(--zz-text)',
                opacity: 0.6,
                textAlign: 'center',
                textTransform: 'lowercase'
              }}>
                × error saving. please try again.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}