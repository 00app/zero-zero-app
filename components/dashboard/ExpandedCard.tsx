import { useState, useEffect } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import { carbonCalculator, CarbonFootprint } from '../../services/carbonCalculations';
import { apiService, PersonalizedTip } from '../../services/apiService';
import { DashboardModule } from './Dashboard';

interface ExpandedCardProps {
  cardId: string;
  module: DashboardModule;
  userData: OnboardingData;
  showZai: boolean;
  onClose: () => void;
  onZaiToggle: () => void;
}

interface ExpandedCardData {
  title: string;
  value: string;
  description: string;
  action: string;
  details: {
    overview: string;
    benefits: string[];
    steps: string[];
    timeframe: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  savings?: {
    carbon?: number;
    money?: number;
  };
  zaiInsight?: string;
}

export function ExpandedCard({ 
  cardId, 
  module, 
  userData, 
  showZai, 
  onClose, 
  onZaiToggle 
}: ExpandedCardProps) {
  const [cardData, setCardData] = useState<ExpandedCardData | null>(null);
  const [carbonData, setCarbonData] = useState<CarbonFootprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExpandedData = async () => {
      setIsLoading(true);
      
      try {
        const footprint = carbonCalculator.calculateFullFootprint(userData);
        setCarbonData(footprint);
        
        const location = await apiService.getLocationFromPostcode(userData.postcode);
        const personalizedTips = await apiService.generatePersonalizedTips(userData, footprint, location);
        
        const expandedData = await generateExpandedCardData(cardId, module, userData, footprint, personalizedTips);
        setCardData(expandedData);
      } catch (error) {
        console.error('Error loading expanded card data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpandedData();
  }, [cardId, module, userData]);

  const generateExpandedCardData = async (
    cardId: string,
    module: DashboardModule,
    userData: OnboardingData,
    footprint: CarbonFootprint,
    tips: PersonalizedTip[]
  ): Promise<ExpandedCardData> => {
    // Find matching tip or generate default data
    const matchingTip = tips.find(tip => tip.id === cardId);
    
    if (matchingTip) {
      return {
        title: matchingTip.title,
        value: `${matchingTip.potentialSaving.carbon.toFixed(1)}t co₂ saved`,
        description: matchingTip.content,
        action: matchingTip.action,
        details: {
          overview: matchingTip.content,
          benefits: [
            `reduce carbon footprint by ${matchingTip.potentialSaving.carbon.toFixed(1)} tonnes annually`,
            `save £${Math.round(matchingTip.potentialSaving.money)} per year`,
            'contribute to local environmental goals',
            'set positive example in your community'
          ],
          steps: generateActionSteps(matchingTip.title, userData),
          timeframe: getTimeframe(matchingTip.title),
          difficulty: getDifficulty(matchingTip.title)
        },
        savings: matchingTip.potentialSaving,
        zaiInsight: generateZaiInsight(matchingTip, userData, footprint)
      };
    }

    // Generate default data for system cards
    return generateSystemCardData(cardId, module, userData, footprint);
  };

  const generateActionSteps = (title: string, userData: OnboardingData): string[] => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('energy') || lowerTitle.includes('renewable')) {
      return [
        'research renewable energy providers in your area',
        'compare tariffs and green credentials',
        'contact your chosen provider for a quote',
        'schedule the switch for next billing cycle',
        'monitor your first bill for savings'
      ];
    }
    
    if (lowerTitle.includes('transport') || lowerTitle.includes('car') || lowerTitle.includes('electric')) {
      return [
        'assess your current transport needs and patterns',
        'research electric vehicle options and grants',
        'test drive 2-3 different EV models',
        'arrange financing and charging setup',
        'trade in your current vehicle'
      ];
    }
    
    if (lowerTitle.includes('insulation') || lowerTitle.includes('home')) {
      return [
        'book a free home energy assessment',
        'get quotes from 3 insulation installers',
        'apply for available grants and subsidies',
        'schedule installation during optimal weather',
        'monitor heating bills for improvements'
      ];
    }
    
    if (lowerTitle.includes('food') || lowerTitle.includes('local') || lowerTitle.includes('market')) {
      return [
        'find local farmers markets and opening times',
        'start with one weekly shop at the market',
        'build relationships with local producers',
        'gradually increase percentage of local shopping',
        'track savings and food quality improvements'
      ];
    }
    
    return [
      'research the best approach for your situation',
      'set a realistic timeline and budget',
      'take the first small step this week',
      'track progress and adjust as needed',
      'celebrate milestones along the way'
    ];
  };

  const getTimeframe = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('switch') || lowerTitle.includes('energy provider')) {
      return '2-4 weeks';
    }
    
    if (lowerTitle.includes('electric') || lowerTitle.includes('car')) {
      return '2-6 months';
    }
    
    if (lowerTitle.includes('insulation') || lowerTitle.includes('renovation')) {
      return '1-3 months';
    }
    
    return '1-2 months';
  };

  const getDifficulty = (title: string): 'easy' | 'medium' | 'hard' => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('switch') || lowerTitle.includes('market') || lowerTitle.includes('local')) {
      return 'easy';
    }
    
    if (lowerTitle.includes('insulation') || lowerTitle.includes('thermostat')) {
      return 'medium';
    }
    
    if (lowerTitle.includes('electric') || lowerTitle.includes('renovation')) {
      return 'hard';
    }
    
    return 'medium';
  };

  const generateZaiInsight = (tip: PersonalizedTip, userData: OnboardingData, footprint: CarbonFootprint): string => {
    const insights = [
      `based on your current ${userData.energySource} energy setup, this change would be particularly effective for you.`,
      `your location in ${userData.postcode} has good infrastructure to support this change.`,
      `this aligns perfectly with your goal to ${userData.goals?.[0] || 'reduce environmental impact'}.`,
      `people with similar profiles save an average of 15% more than expected with this action.`,
      `the timing is ideal - implementation costs are 20% lower this quarter.`,
      `your current spending pattern suggests you'd see benefits within 3 months.`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  };

  const generateSystemCardData = (
    cardId: string,
    module: DashboardModule,
    userData: OnboardingData,
    footprint: CarbonFootprint
  ): ExpandedCardData => {
    // Handle system cards like breakdowns, comparisons, etc.
    if (cardId.includes('breakdown')) {
      return {
        title: 'your carbon breakdown',
        value: `${footprint.total.toFixed(1)}t co₂/year`,
        description: 'detailed analysis of your carbon footprint across all major categories',
        action: 'optimize categories',
        details: {
          overview: `your total carbon footprint of ${footprint.total.toFixed(1)} tonnes per year breaks down across four main categories: home energy consumption, transport choices, spending patterns, and food choices.`,
          benefits: [
            'understand your biggest impact areas',
            'prioritize reduction efforts effectively',
            'track improvements over time',
            'compare with similar households'
          ],
          steps: [
            'review each category contribution',
            'identify the largest contributors',
            'set reduction targets for each area',
            'implement changes starting with highest impact',
            'monitor monthly progress'
          ],
          timeframe: 'ongoing',
          difficulty: 'easy'
        },
        savings: {
          carbon: footprint.savings.potential,
          money: footprint.savings.monthlyMoney * 12
        },
        zaiInsight: `your home energy represents ${((footprint.breakdown.home / footprint.total) * 100).toFixed(0)}% of your footprint - this is ${footprint.breakdown.home > footprint.breakdown.transport ? 'higher' : 'lower'} than the transport category, making it a ${footprint.breakdown.home > footprint.breakdown.transport ? 'priority' : 'secondary'} area for improvement.`
      };
    }
    
    // Default card data
    return {
      title: cardId.replace(/-/g, ' '),
      value: 'detailed view',
      description: 'explore this area in more detail',
      action: 'take action',
      details: {
        overview: 'this is a detailed view of the selected item.',
        benefits: ['benefit 1', 'benefit 2', 'benefit 3'],
        steps: ['step 1', 'step 2', 'step 3'],
        timeframe: '1-2 months',
        difficulty: 'medium'
      },
      zaiInsight: 'this action could be particularly beneficial for your situation.'
    };
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-accent';
    }
  };

  const getDifficultyEmoji = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  if (isLoading || !cardData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="zz-h3 text-accent animate-pulse">loading details...</div>
          <div className="zz-p2 text-muted-foreground">preparing personalized insights</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="zz-h3 text-accent">{cardData.title}</h1>
        <div className="zz-h4 text-foreground">{cardData.value}</div>
        {cardData.savings && (
          <div className="flex justify-center space-x-4 zz-p2 text-muted-foreground">
            {cardData.savings.carbon && (
              <span>🌱 {cardData.savings.carbon.toFixed(1)}t co₂/year</span>
            )}
            {cardData.savings.money && (
              <span>💰 £{Math.round(cardData.savings.money)}/year</span>
            )}
          </div>
        )}
      </div>

      {/* Overview */}
      <div className="zz-card">
        <h3 className="zz-h5 mb-3">overview</h3>
        <p className="zz-p1 text-muted-foreground leading-relaxed">
          {cardData.details.overview}
        </p>
      </div>

      {/* Benefits */}
      <div className="zz-card">
        <h3 className="zz-h5 mb-3">benefits</h3>
        <ul className="space-y-2">
          {cardData.details.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-accent mt-1">•</span>
              <span className="zz-p1 text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Steps */}
      <div className="zz-card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="zz-h5">action steps</h3>
          <div className="flex items-center space-x-2">
            <span className="zz-p3 text-muted-foreground">{cardData.details.timeframe}</span>
            <span className={`zz-p3 ${getDifficultyColor(cardData.details.difficulty)}`}>
              {getDifficultyEmoji(cardData.details.difficulty)} {cardData.details.difficulty}
            </span>
          </div>
        </div>
        <ol className="space-y-3">
          {cardData.details.steps.map((step, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center zz-p3 mt-0.5">
                {index + 1}
              </div>
              <span className="zz-p1 text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Zai Insight */}
      {showZai && cardData.zaiInsight && (
        <div className="zz-card bg-accent/10 border-accent/20">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="zz-p2 text-accent-foreground">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="zz-h5 text-accent mb-2">zai insight</h3>
              <p className="zz-p1 text-accent">
                {cardData.zaiInsight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur pt-4">
        <button className="w-full zz-button mb-4">
          {cardData.action}
        </button>
        
        <div className="flex justify-center space-x-8 pb-4">
          <button
            onClick={onZaiToggle}
            className={`zz-p2 transition-colors ${
              showZai ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {showZai ? 'hide' : 'show'} zai insights
          </button>
          
          <button
            onClick={onClose}
            className="zz-p2 text-muted-foreground hover:text-foreground transition-colors"
          >
            swipe ↓ to close
          </button>
        </div>
      </div>
    </div>
  );
}