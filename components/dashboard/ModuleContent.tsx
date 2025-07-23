
import { useState, useEffect } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import { carbonCalculator, CarbonFootprint } from '../../services/carbonCalculations';
import { apiService, PersonalizedTip, LocationData } from '../../services/apiService';
import { DashboardModule } from './Dashboard';
import { PipProgress } from '../PipProgress';

interface ModuleContentProps {
  module: DashboardModule;
  userData: OnboardingData;
  currentCardIndex: number;
  onCardIndexChange: (index: number) => void;
  onCardExpand: (cardId: string) => void;
}

interface Card {
  id: string;
  title: string;
  value: string;
  description: string;
  action: string;
  priority?: number;
  savings?: {
    carbon?: number;
    money?: number;
  };
  category?: string;
}

export function ModuleContent({ 
  module, 
  userData, 
  currentCardIndex, 
  onCardIndexChange, 
  onCardExpand 
}: ModuleContentProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [carbonData, setCarbonData] = useState<CarbonFootprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModuleContent = async () => {
      setIsLoading(true);
      
      try {
        const footprint = carbonCalculator.calculateFullFootprint(userData);
        setCarbonData(footprint);

        const location = await apiService.getLocationFromPostcode(userData.postcode);
        const personalizedTips = await apiService.generatePersonalizedTips(userData, footprint, location);
        
        let moduleCards: Card[] = [];

        switch (module) {
          case 'carbon':
            moduleCards = await generateCarbonCards(footprint, personalizedTips, userData);
            break;
          case 'money':
            moduleCards = await generateMoneyCards(footprint, personalizedTips, userData);
            break;
          case 'local':
            moduleCards = await generateLocalCards(location, userData);
            break;
          case 'partners':
            moduleCards = await generatePartnerCards(userData);
            break;
        }

        setCards(moduleCards);
      } catch (error) {
        console.error('Error loading module content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModuleContent();
  }, [module, userData]);

  const generateCarbonCards = async (
    footprint: CarbonFootprint, 
    tips: PersonalizedTip[], 
    userData: OnboardingData
  ): Promise<Card[]> => {
    const carbonTips = tips.filter(tip => tip.category === 'carbon').slice(0, 6);
    
    const cards: Card[] = [
      {
        id: 'carbon-breakdown',
        title: 'your carbon breakdown',
        value: `${footprint.total.toFixed(1)}t`,
        description: `home: ${footprint.breakdown.home.toFixed(1)}t • transport: ${footprint.breakdown.transport.toFixed(1)}t • spending: ${footprint.breakdown.spending.toFixed(1)}t`,
        action: 'see detailed breakdown',
        category: 'overview'
      },
      {
        id: 'carbon-comparison',
        title: 'vs. averages',
        value: footprint.total < footprint.comparisons.countryAverage ? 'below average' : 'above average',
        description: `world: ${footprint.comparisons.worldAverage}t • country: ${footprint.comparisons.countryAverage}t • you: ${footprint.total.toFixed(1)}t`,
        action: 'explore comparisons',
        category: 'comparison'
      },
      {
        id: 'carbon-potential',
        title: 'reduction potential',
        value: `${footprint.savings.potential.toFixed(1)}t`,
        description: `${footprint.savings.actions.length} actionable areas identified`,
        action: 'start reducing',
        category: 'action',
        savings: { carbon: footprint.savings.potential }
      }
    ];

    // Add personalized carbon tips
    carbonTips.forEach(tip => {
      cards.push({
        id: tip.id,
        title: tip.title,
        value: `${tip.potentialSaving.carbon.toFixed(1)}t`,
        description: tip.content.slice(0, 100) + '...',
        action: tip.action,
        priority: tip.priority,
        savings: tip.potentialSaving,
        category: 'tip'
      });
    });

    return cards;
  };

  const generateMoneyCards = async (
    footprint: CarbonFootprint, 
    tips: PersonalizedTip[], 
    userData: OnboardingData
  ): Promise<Card[]> => {
    const moneyTips = tips.filter(tip => tip.potentialSaving.money > 0).slice(0, 6);
    
    const cards: Card[] = [
      {
        id: 'money-potential',
        title: 'monthly savings potential',
        value: `£${footprint.savings.monthlyMoney}`,
        description: `£${footprint.savings.monthlyMoney * 12} annually through sustainable choices`,
        action: 'see breakdown',
        category: 'overview',
        savings: { money: footprint.savings.monthlyMoney * 12 }
      },
      {
        id: 'money-energy',
        title: 'energy savings',
        value: `£${Math.round(userData.monthlySpend * 0.15)}`,
        description: 'reduce heating & electricity costs',
        action: 'optimize energy use',
        category: 'energy',
        savings: { money: userData.monthlySpend * 0.15 * 12 }
      },
      {
        id: 'money-transport',
        title: 'transport savings',
        value: userData.transport === 'car' ? '£150' : '£50',
        description: userData.transport === 'car' ? 'reduce fuel & maintenance costs' : 'optimize current transport',
        action: 'explore options',
        category: 'transport',
        savings: { money: userData.transport === 'car' ? 1800 : 600 }
      }
    ];

    // Add personalized money tips
    moneyTips.forEach(tip => {
      cards.push({
        id: tip.id,
        title: tip.title,
        value: `£${Math.round(tip.potentialSaving.money)}`,
        description: tip.content.slice(0, 100) + '...',
        action: tip.action,
        priority: tip.priority,
        savings: tip.potentialSaving,
        category: 'tip'
      });
    });

    return cards;
  };

  const generateLocalCards = async (location: LocationData, userData: OnboardingData): Promise<Card[]> => {
    const businesses = await apiService.getLocalBusinesses(location.coordinates, '');
    
    const cards: Card[] = [
      {
        id: 'local-overview',
        title: `${location.city} impact`,
        value: '3 miles',
        description: 'your local sustainability radius',
        action: 'explore local area',
        category: 'overview'
      }
    ];

    businesses.forEach((business, index) => {
      cards.push({
        id: `local-${index}`,
        title: business.name,
        value: business.distance,
        description: `${business.sustainability} • ${business.savings}`,
        action: 'get directions',
        category: business.category
      });
    });

    return cards;
  };

  const generatePartnerCards = async (userData: OnboardingData): Promise<Card[]> => {
    const offers = await apiService.getPartnerOffers(userData);
    
    const cards: Card[] = [
      {
        id: 'partners-overview',
        title: 'exclusive access',
        value: `${offers.length} offers`,
        description: 'partner discounts matching your goals',
        action: 'browse all offers',
        category: 'overview'
      }
    ];

    offers.forEach((offer, index) => {
      cards.push({
        id: `partner-${index}`,
        title: offer.partner,
        value: offer.savings,
        description: offer.offer,
        action: 'claim offer',
        category: offer.category
      });
    });

    return cards;
  };

  const handleCardSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentCardIndex < cards.length - 1) {
      onCardIndexChange(currentCardIndex + 1);
    } else if (direction === 'right' && currentCardIndex > 0) {
      onCardIndexChange(currentCardIndex - 1);
    }
  };

  const getModuleEmoji = (module: DashboardModule) => {
    switch (module) {
      case 'carbon': return '🌱';
      case 'money': return '💰';
      case 'local': return '🏘️';
      case 'partners': return '🤝';
      default: return '📊';
    }
  };

  const getModuleTitle = (module: DashboardModule) => {
    switch (module) {
      case 'carbon': return 'carbon reduction';
      case 'money': return 'save money';
      case 'local': return 'local impact';
      case 'partners': return 'partner offers';
      default: return module;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="zz-h3 text-accent animate-pulse">loading {module} insights...</div>
          <div className="zz-p2 text-muted-foreground">personalizing content</div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="zz-h3 text-muted-foreground">no {module} data available</div>
          <div className="zz-p2 text-muted-foreground">check back later</div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="flex-1 flex flex-col justify-center space-y-8">
      {/* Module Header */}
      <div className="text-center">
        <div className="text-3xl mb-2">{getModuleEmoji(module)}</div>
        <h2 className="zz-h3 text-accent mb-2">{getModuleTitle(module)}</h2>
        <p className="zz-p2 text-muted-foreground">
          {currentCardIndex + 1} of {cards.length}
        </p>
      </div>

      {/* Current Card */}
      <div 
        className="zz-card min-h-[200px] touch-manipulation cursor-pointer transform transition-all duration-200 hover:scale-105"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const startX = touch.clientX;
          
          const handleTouchEnd = (endEvent: TouchEvent) => {
            const endTouch = endEvent.changedTouches[0];
            const deltaX = endTouch.clientX - startX;
            
            if (Math.abs(deltaX) > 50) {
              handleCardSwipe(deltaX > 0 ? 'right' : 'left');
            }
            
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          document.addEventListener('touchend', handleTouchEnd);
        }}
        onClick={() => onCardExpand(currentCard.id)}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="zz-h4">{currentCard.title}</h3>
            {currentCard.priority && (
              <div className="zz-p3 text-accent bg-accent/10 px-2 py-1 rounded">
                priority {currentCard.priority}/10
              </div>
            )}
          </div>
          
          <div className="text-center py-4">
            <div className="zz-h2 text-accent mb-2">{currentCard.value}</div>
            {currentCard.savings && (
              <div className="flex justify-center space-x-4 zz-p3 text-muted-foreground">
                {currentCard.savings.carbon && (
                  <span>🌱 {currentCard.savings.carbon.toFixed(1)}t co₂</span>
                )}
                {currentCard.savings.money && (
                  <span>💰 £{Math.round(currentCard.savings.money)}</span>
                )}
              </div>
            )}
          </div>
          
          <p className="zz-p1 text-muted-foreground">
            {currentCard.description}
          </p>
          
          <div className="text-center">
            <span className="zz-p2 text-accent">
              tap ↑ to {currentCard.action}
            </span>
          </div>
        </div>
      </div>

      {/* Card Navigation */}
      <div className="flex justify-center">
        <PipProgress
          current={currentCardIndex + 1}
          total={cards.length}
          size="sm"
          onClick={(index) => onCardIndexChange(index - 1)}
        />
      </div>

      {/* Quick Stats for Module */}
      {carbonData && (
        <div className="grid grid-cols-2 gap-4">
          {module === 'carbon' && (
            <>
              <div className="text-center zz-card">
                <div className="zz-h5 text-green-400">{carbonData.savings.potential.toFixed(1)}t</div>
                <div className="zz-p3 text-muted-foreground">reducible</div>
              </div>
              <div className="text-center zz-card">
                <div className="zz-h5 text-green-400">{carbonData.savings.actions.length}</div>
                <div className="zz-p3 text-muted-foreground">action areas</div>
              </div>
            </>
          )}
          
          {module === 'money' && (
            <>
              <div className="text-center zz-card">
                <div className="zz-h5 text-yellow-400">£{carbonData.savings.monthlyMoney}</div>
                <div className="zz-p3 text-muted-foreground">monthly</div>
              </div>
              <div className="text-center zz-card">
                <div className="zz-h5 text-yellow-400">£{carbonData.savings.monthlyMoney * 12}</div>
                <div className="zz-p3 text-muted-foreground">yearly</div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="text-center">
        <p className="zz-p3 text-muted-foreground">
          swipe ← → for cards • tap ↑ to expand • swipe ↓ to return
        </p>
      </div>
    </div>
  );
}
