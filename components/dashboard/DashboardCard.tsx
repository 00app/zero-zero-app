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
  
  // Sample card data based on category and index
  const cardTemplates = {
    travel: [
      {
        title: 'public transport',
        carbonStat: '-2.3kg co₂/week',
        moneyStat: '£12 saved',
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
        moneyStat: '£8 saved',
        zaiTip: 'walking trips under 1 mile boost health and eliminate transport costs entirely.',
        input: {
          label: 'track your walking',
          placeholder: 'how many walking trips this week?'
        }
      },
      {
        title: 'cycle to work',
        carbonStat: '-4.2kg co₂/week',
        moneyStat: '£25 saved',
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
        moneyStat: '£15 saved',
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
        moneyStat: '£6 saved',
        zaiTip: 'local seasonal food reduces transport emissions and often costs less than imported options.',
        input: {
          label: 'local food tracker',
          placeholder: 'which local foods did you try?'
        }
      },
      {
        title: 'food waste reduction',
        carbonStat: '-2.1kg co₂/week',
        moneyStat: '£18 saved',
        zaiTip: 'meal planning and proper storage cuts household food waste by 60%. use leftovers creatively.',
        externalLink: {
          text: 'get food waste tips',
          url: 'https://www.lovefoodhatewaste.com'
        }
      }
    ],
    devices: [
      {
        title: 'device standby power',
        carbonStat: '-0.7kg co₂/week',
        moneyStat: '£3 saved',
        zaiTip: 'unplugging devices when not in use saves £85 annually. gaming consoles use most standby power.',
        action: {
          text: 'unplug 3 devices tonight before bed?',
          points: 20,
          actionType: 'energy'
        }
      },
      {
        title: 'device lifespan',
        carbonStat: '-3.2kg co₂/month',
        moneyStat: '£45 saved',
        zaiTip: 'keeping phones 1 year longer prevents 70kg co₂ and saves hundreds. repair instead of replace.',
        input: {
          label: 'device age tracker',
          placeholder: 'how old is your main device?'
        }
      },
      {
        title: 'energy efficient settings',
        carbonStat: '-1.1kg co₂/week',
        moneyStat: '£4 saved',
        zaiTip: 'dark mode, lower brightness, and power saving modes reduce battery drain and energy use.',
        externalLink: {
          text: 'optimize device settings',
          url: 'https://www.energysavingtrust.org.uk/hub/quick-tips-to-save-energy'
        }
      }
    ],
    shopping: [
      {
        title: 'second-hand first',
        carbonStat: '-5.2kg co₂/month',
        moneyStat: '£35 saved',
        zaiTip: 'buying used reduces manufacturing emissions by 80%. check depop, vinted, and local charity shops.',
        action: {
          text: 'buy next item second-hand instead of new?',
          points: 40,
          actionType: 'shopping'
        }
      },
      {
        title: 'repair and reuse',
        carbonStat: '-2.8kg co₂/month',
        moneyStat: '£22 saved',
        zaiTip: 'repairing extends product life and prevents waste. many items can be fixed for under £10.',
        input: {
          label: 'repair tracker',
          placeholder: 'what did you repair or reuse?'
        }
      },
      {
        title: 'buy nothing groups',
        carbonStat: '-4.1kg co₂/month',
        moneyStat: '£28 saved',
        zaiTip: 'local sharing groups provide free items and reduce consumption. give away unused items too.',
        externalLink: {
          text: 'find local buy nothing groups',
          url: 'https://www.facebook.com/groups/BuyNothingUK'
        }
      }
    ],
    holidays: [
      {
        title: 'staycations',
        carbonStat: '-12kg co₂/trip',
        moneyStat: '£200 saved',
        zaiTip: 'uk breaks eliminate flight emissions and often cost 70% less. explore hidden gems locally.',
        action: {
          text: 'plan next holiday within uk?',
          points: 80,
          actionType: 'travel'
        }
      },
      {
        title: 'train travel',
        carbonStat: '-8kg co₂/trip',
        moneyStat: '£50 saved',
        zaiTip: 'trains produce 6x less co₂ than flights. book advance tickets for best prices to europe.',
        input: {
          label: 'train trip planner',
          placeholder: 'where would you like to travel by train?'
        }
      },
      {
        title: 'carbon offsetting',
        carbonStat: 'varies',
        moneyStat: '£8-20/tonne',
        zaiTip: 'offset unavoidable flights through verified schemes. gold standard projects are most reliable.',
        externalLink: {
          text: 'calculate and offset flights',
          url: 'https://www.carbonfund.org/calculate'
        }
      }
    ],
    water: [
      {
        title: 'shower timer',
        carbonStat: '-1.2kg co₂/week',
        moneyStat: '£9 saved',
        zaiTip: '4-minute showers instead of 8 minutes halves water heating costs and carbon footprint.',
        action: {
          text: 'try 4-minute showers this week?',
          points: 25,
          actionType: 'water'
        }
      },
      {
        title: 'cold water washing',
        carbonStat: '-0.8kg co₂/week',
        moneyStat: '£6 saved',
        zaiTip: '30°c washing cleans effectively and uses 40% less energy than hot washes.',
        input: {
          label: 'cold wash tracker',
          placeholder: 'how many cold washes this week?'
        }
      },
      {
        title: 'water-saving devices',
        carbonStat: '-2.1kg co₂/month',
        moneyStat: '£12 saved',
        zaiTip: 'low-flow showerheads and tap aerators reduce water use by 50% with no comfort loss.',
        externalLink: {
          text: 'get free water-saving kit',
          url: 'https://www.savewatersavemoney.co.uk'
        }
      }
    ],
    pets: [
      {
        title: 'sustainable pet food',
        carbonStat: '-1.5kg co₂/week',
        moneyStat: '£8 saved',
        zaiTip: 'insect-based pet food has 75% lower carbon footprint than meat. pets adapt quickly.',
        action: {
          text: 'try sustainable pet food this month?',
          points: 35,
          actionType: 'pet'
        }
      },
      {
        title: 'diy pet toys',
        carbonStat: '-0.3kg co₂/month',
        moneyStat: '£15 saved',
        zaiTip: 'cardboard boxes, old socks, and rope make engaging toys. pets often prefer simple options.',
        input: {
          label: 'diy toy tracker',
          placeholder: 'what toys did you make?'
        }
      },
      {
        title: 'local pet services',
        carbonStat: '-0.9kg co₂/month',
        moneyStat: '£12 saved',
        zaiTip: 'walking dogs locally and using nearby vets reduces transport emissions and supports community.',
        externalLink: {
          text: 'find local pet services',
          url: 'https://www.rover.com/uk'
        }
      }
    ],
    rewards: [
      {
        title: 'zero zero points',
        carbonStat: 'track progress',
        moneyStat: 'earn rewards',
        zaiTip: 'completing actions earns points. redeem for discounts at eco-friendly brands and services.',
        action: {
          text: 'view available rewards?',
          points: 0,
          actionType: 'rewards'
        }
      },
      {
        title: 'community challenges',
        carbonStat: 'group impact',
        moneyStat: 'shared savings',
        zaiTip: 'join neighbourhood challenges to multiply impact. team efforts create lasting change.',
        input: {
          label: 'challenge tracker',
          placeholder: 'which challenge interests you?'
        }
      },
      {
        title: 'impact dashboard',
        carbonStat: 'total saved',
        moneyStat: 'annual savings',
        zaiTip: 'track your cumulative carbon and money savings. share achievements to inspire others.',
        externalLink: {
          text: 'view detailed impact report',
          url: '#impact-report'
        }
      }
    ]
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
    zaiTip: cardData.zaiTip,
    action: cardData.action,
    input: cardData.input,
    externalLink: cardData.externalLink,
    visualComparison: cardData.visualComparison
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
    // Here you could integrate with Supabase to save the action
    onExpand(); // Close the card after action
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      console.log(`Input submitted for card ${cardData.id}:`, inputValue);
      // Here you could integrate with Supabase to save the input
      setInputValue('');
      onExpand(); // Close the card after input
    }
  };

  const handleExternalLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle card click - always allow toggling
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on interactive elements
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
        className={`h-full border-2 transition-all duration-300`}
        style={{ 
          background: 'var(--zz-card)',
          borderColor: isExpanded ? 'var(--zz-accent)' : 'var(--zz-border)',
          borderRadius: '0',
          padding: 'var(--spacing-md)',
          minHeight: isExpanded ? '600px' : '400px'
        }}
        onClick={handleCardClick}
      >
        {/* Card Header - Always clickable */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="zz-small opacity-60 mb-2" style={{ 
              lineHeight: 1.2,
              textTransform: 'lowercase'
            }}>
              {cardData.category}
            </div>
            <div className="zz-large" style={{ 
              fontWeight: 'var(--font-regular)', 
              lineHeight: 1.2,
              textTransform: 'lowercase'
            }}>
              {cardData.title}
            </div>
          </div>
          
          <motion.button
            className="zz-large opacity-60 select-none p-2 -m-2"
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ lineHeight: 1, cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            +
          </motion.button>
        </div>

        {/* Collapsed View - Preview Stats */}
        {!isExpanded && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {cardData.carbonStat && (
              <div className="flex justify-between items-center py-2">
                <span className="zz-medium opacity-80" style={{ lineHeight: 1.2 }}>carbon</span>
                <span className="zz-medium" style={{ fontWeight: 'var(--font-medium)', lineHeight: 1.2 }}>
                  {cardData.carbonStat}
                </span>
              </div>
            )}
            {cardData.moneyStat && (
              <div className="flex justify-between items-center py-2">
                <span className="zz-medium opacity-80" style={{ lineHeight: 1.2 }}>money</span>
                <span className="zz-medium" style={{ fontWeight: 'var(--font-medium)', lineHeight: 1.2 }}>
                  {cardData.moneyStat}
                </span>
              </div>
            )}
            {cardData.waterStat && (
              <div className="flex justify-between items-center py-2">
                <span className="zz-medium opacity-80" style={{ lineHeight: 1.2 }}>water</span>
                <span className="zz-medium" style={{ fontWeight: 'var(--font-medium)', lineHeight: 1.2 }}>
                  {cardData.waterStat}
                </span>
              </div>
            )}
            
            <div className="pt-6 mt-6" style={{ borderTop: '1px solid var(--zz-border)' }}>
              <div className="zz-small opacity-60" style={{ lineHeight: 1.2 }}>tap to expand</div>
            </div>
          </motion.div>
        )}

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Large Stats Display */}
              <div className="grid grid-cols-1 gap-6">
                {cardData.carbonStat && (
                  <div className="text-center py-4">
                    <div className="zz-small opacity-60 mb-2" style={{ 
                      lineHeight: 1.2,
                      textTransform: 'lowercase'
                    }}>
                      carbon footprint
                    </div>
                    <div 
                      className="text-4xl mb-2" 
                      style={{ fontWeight: 'var(--font-medium)', lineHeight: 1.2 }}
                    >
                      {cardData.carbonStat}
                    </div>
                  </div>
                )}
                
                {cardData.moneyStat && (
                  <div className="text-center py-4">
                    <div className="zz-small opacity-60 mb-2" style={{ 
                      lineHeight: 1.2,
                      textTransform: 'lowercase'
                    }}>
                      cost impact
                    </div>
                    <div 
                      className="text-4xl mb-2" 
                      style={{ fontWeight: 'var(--font-medium)', lineHeight: 1.2 }}
                    >
                      {cardData.moneyStat}
                    </div>
                  </div>
                )}
                
                {cardData.waterStat && (
                  <div className="text-center py-4">
                    <div className="zz-small opacity-60 mb-2" style={{ 
                      lineHeight: 1.2,
                      textTransform: 'lowercase'
                    }}>
                      water usage
                    </div>
                    <div 
                      className="text-4xl mb-2" 
                      style={{ fontWeight: 'var(--font-medium)', lineHeight: 1.2 }}
                    >
                      {cardData.waterStat}
                    </div>
                  </div>
                )}
              </div>

              {/* Zai AI Tip */}
              <div className="space-y-4 py-4">
                <div className="zz-small opacity-60" style={{ 
                  lineHeight: 1.2,
                  textTransform: 'lowercase'
                }}>
                  zai says
                </div>
                <div className="zz-medium" style={{ lineHeight: 1.4 }}>
                  {aiTip || cardData.zaiTip}
                </div>
              </div>

              {/* Action Buttons */}
              {cardData.action && (
                <div className="space-y-6 py-4">
                  <div className="text-center">
                    <div className="zz-medium mb-6" style={{ lineHeight: 1.4 }}>
                      {cardData.action.text}
                    </div>
                    
                    <div className="flex justify-center gap-6">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(true);
                        }}
                        className="w-20 h-20 border-2 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{ 
                          borderColor: 'var(--zz-border)',
                          background: 'transparent',
                          fontSize: 'var(--text-large)',
                          lineHeight: 1
                        }}
                        whileHover={{ 
                          borderColor: 'var(--zz-accent)',
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
                        className="w-20 h-20 border-2 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{ 
                          borderColor: 'var(--zz-border)',
                          background: 'transparent',
                          fontSize: 'var(--text-large)',
                          lineHeight: 1
                        }}
                        whileHover={{ 
                          borderColor: 'var(--zz-accent)',
                          background: 'var(--zz-accent)',
                          color: 'var(--zz-bg)',
                          scale: 1.05 
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ×
                      </motion.button>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span className="zz-small opacity-80" style={{ lineHeight: 1.2 }}>
                        earn {cardData.action.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Field */}
              {cardData.input && (
                <div className="space-y-4 py-4">
                  <div className="zz-small opacity-60" style={{ 
                    lineHeight: 1.2,
                    textTransform: 'lowercase'
                  }}>
                    {cardData.input.label}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={cardData.input.placeholder}
                      className="flex-1 zz-input border-2 py-3 px-4"
                      style={{ 
                        borderColor: 'var(--zz-border)',
                        background: 'transparent',
                        color: 'var(--zz-text)',
                        fontSize: 'var(--text-medium)',
                        lineHeight: 1.2,
                        borderRadius: '0'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInputSubmit();
                      }}
                      className="px-6 py-3 border-2 transition-all duration-300"
                      style={{ 
                        borderColor: 'var(--zz-border)',
                        background: 'transparent',
                        fontSize: 'var(--text-medium)',
                        lineHeight: 1.2,
                        borderRadius: '0'
                      }}
                      whileHover={{ 
                        borderColor: 'var(--zz-accent)',
                        background: 'var(--zz-accent)',
                        color: 'var(--zz-bg)'
                      }}
                      disabled={!inputValue.trim()}
                    >
                      <span className="zz-medium">save</span>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* External Link */}
              {cardData.externalLink && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExternalLinkClick(cardData.externalLink!.url);
                  }}
                  className="w-full p-4 border-2 transition-all duration-300"
                  style={{ 
                    borderColor: 'var(--zz-border)',
                    background: 'transparent',
                    borderRadius: '0',
                    fontSize: 'var(--text-medium)',
                    lineHeight: 1.2
                  }}
                  whileHover={{ 
                    borderColor: 'var(--zz-accent)',
                    background: 'var(--zz-accent)',
                    color: 'var(--zz-bg)',
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="zz-medium">
                    {cardData.externalLink.text} →
                  </div>
                </motion.button>
              )}

              {/* Close Button */}
              <div className="text-center pt-6">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand();
                  }}
                  className="zz-small opacity-60 hover:opacity-100 transition-opacity p-4"
                  style={{ lineHeight: 1.2 }}
                  whileHover={{ scale: 1.05 }}
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