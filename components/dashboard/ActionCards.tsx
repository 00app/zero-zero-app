import { useState, useEffect } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import { carbonCalculator, CarbonFootprint } from '../../services/carbonCalculations';
import { apiService, PersonalizedTip, LocationData } from '../../services/apiService';

interface ActionCardsProps {
  userData: OnboardingData;
  currentView: 'carbon' | 'money' | 'local' | 'partners';
  onSignupPrompt: () => void;
}

export function ActionCards({ userData, currentView, onSignupPrompt }: ActionCardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [personalizedTips, setPersonalizedTips] = useState<PersonalizedTip[]>([]);
  const [localBusinesses, setLocalBusinesses] = useState<any[]>([]);
  const [partnerOffers, setPartnerOffers] = useState<any[]>([]);
  const [carbonData, setCarbonData] = useState<CarbonFootprint | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Calculate carbon footprint
      const footprint = carbonCalculator.calculateFullFootprint(userData);
      setCarbonData(footprint);

      // Get location data
      const location = await apiService.getLocationFromPostcode(userData.postcode);
      setLocationData(location);

      // Generate personalized tips
      const tips = await apiService.generatePersonalizedTips(userData, footprint, location);
      setPersonalizedTips(tips);

      // Get local businesses
      const businesses = await apiService.getLocalBusinesses(location.coordinates, '');
      setLocalBusinesses(businesses);

      // Get partner offers
      const offers = await apiService.getPartnerOffers(userData);
      setPartnerOffers(offers);
    };

    loadData();
  }, [userData]);

  const getCurrentCards = () => {
    switch (currentView) {
      case 'carbon':
        return personalizedTips.filter(tip => tip.category === 'carbon').map(tip => ({
          id: tip.id,
          title: tip.title,
          description: `save ${tip.potentialSaving.carbon.toFixed(1)} tonnes co₂/year`,
          tip: tip.content,
          action: tip.action,
          priority: tip.priority
        }));

      case 'money':
        return personalizedTips.filter(tip => tip.potentialSaving.money > 0).map(tip => ({
          id: tip.id,
          title: tip.title,
          description: `save £${Math.round(tip.potentialSaving.money)}/year`,
          tip: tip.content,
          action: tip.action,
          priority: tip.priority
        }));

      case 'local':
        return localBusinesses.map((business, index) => ({
          id: `local-${index}`,
          title: business.name,
          description: `${business.distance} • ${business.savings}`,
          tip: `${business.sustainability} - supporting local businesses reduces transport emissions and strengthens community`,
          action: 'get directions',
          priority: 5
        }));

      case 'partners':
        return partnerOffers.map((offer, index) => ({
          id: `partner-${index}`,
          title: offer.partner,
          description: offer.offer,
          tip: `${offer.savings} potential savings - exclusive zero zero partner discount`,
          action: 'claim offer',
          priority: offer.relevance === 'high' ? 8 : 6
        }));

      default:
        return [];
    }
  };

  const currentCards = getCurrentCards();

  const handleSwipeLeft = () => {
    setCurrentCardIndex(prev => 
      prev < currentCards.length - 1 ? prev + 1 : 0
    );
  };

  const handleSwipeRight = () => {
    setCurrentCardIndex(prev => 
      prev > 0 ? prev - 1 : currentCards.length - 1
    );
  };

  const handleCardTap = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  if (currentCards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="zz-h4 mb-2">loading recommendations...</h3>
          <div className="animate-pulse bg-muted h-32 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const getViewTitle = () => {
    switch (currentView) {
      case 'carbon': return 'carbon reduction actions';
      case 'money': return 'money saving opportunities';
      case 'local': return 'local businesses near you';
      case 'partners': return 'exclusive partner offers';
      default: return 'recommendations';
    }
  };

  const getViewDescription = () => {
    switch (currentView) {
      case 'carbon': return `reduce ${carbonData?.savings.potential.toFixed(1) || '0'} tonnes co₂/year`;
      case 'money': return `save £${carbonData?.savings.monthlyMoney || 0}/month potential`;
      case 'local': return `${localBusinesses.length} businesses within 2 miles`;
      case 'partners': return `${partnerOffers.length} offers available now`;
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="zz-h4 mb-2">{getViewTitle()}</h3>
        <p className="zz-p3 text-muted-foreground">
          {getViewDescription()}
        </p>
        <p className="zz-p3 text-muted-foreground mt-1">
          swipe ← → to browse • tap to expand
        </p>
      </div>

      <div className="relative">
        <div 
          className="zz-card min-h-[140px] touch-manipulation cursor-pointer transition-all duration-200 hover:shadow-lg"
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const startX = touch.clientX;
            
            const handleTouchEnd = (endEvent: TouchEvent) => {
              const endTouch = endEvent.changedTouches[0];
              const deltaX = endTouch.clientX - startX;
              
              if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                  handleSwipeRight();
                } else {
                  handleSwipeLeft();
                }
              }
              
              document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchend', handleTouchEnd);
          }}
          onClick={() => handleCardTap(currentCards[currentCardIndex].id)}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="zz-h5">{currentCards[currentCardIndex].title}</h4>
              <div className="flex items-center space-x-2">
                {currentView === 'carbon' && (
                  <div className="zz-p3 text-accent">
                    {personalizedTips.find(t => t.id === currentCards[currentCardIndex].id)?.priority || 5}/10
                  </div>
                )}
                <div className="zz-p3 text-muted-foreground">
                  {currentCardIndex + 1}/{currentCards.length}
                </div>
              </div>
            </div>
            
            <p className="zz-p1 text-muted-foreground">
              {currentCards[currentCardIndex].description}
            </p>

            {expandedCard === currentCards[currentCardIndex].id && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="bg-accent/10 p-3 zz-radius">
                  <p className="zz-p2 text-accent">
                    💡 zai tip: {currentCards[currentCardIndex].tip}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {currentView === 'carbon' && carbonData && (
                    <div className="flex justify-between zz-p3 text-muted-foreground">
                      <span>potential carbon reduction</span>
                      <span>{personalizedTips.find(t => t.id === currentCards[currentCardIndex].id)?.potentialSaving.carbon.toFixed(1) || '0'} tonnes/year</span>
                    </div>
                  )}
                  
                  {currentView === 'money' && (
                    <div className="flex justify-between zz-p3 text-muted-foreground">
                      <span>potential annual savings</span>
                      <span>£{personalizedTips.find(t => t.id === currentCards[currentCardIndex].id)?.potentialSaving.money || 0}</span>
                    </div>
                  )}
                  
                  {currentView === 'local' && locationData && (
                    <div className="flex justify-between zz-p3 text-muted-foreground">
                      <span>location</span>
                      <span>{locationData.city}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSignupPrompt();
                  }}
                  className="w-full zz-button"
                >
                  {currentCards[currentCardIndex].action}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-2">
        {currentCards.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentCardIndex ? 'bg-accent' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Quick Stats for Current View */}
      <div className="grid grid-cols-2 gap-4">
        {currentView === 'carbon' && carbonData && (
          <>
            <div className="text-center zz-card">
              <div className="zz-h5 text-accent">{carbonData.savings.potential.toFixed(1)}t</div>
              <div className="zz-p3 text-muted-foreground">reducible co₂</div>
            </div>
            <div className="text-center zz-card">
              <div className="zz-h5 text-accent">{carbonData.savings.actions.length}</div>
              <div className="zz-p3 text-muted-foreground">action areas</div>
            </div>
          </>
        )}
        
        {currentView === 'money' && carbonData && (
          <>
            <div className="text-center zz-card">
              <div className="zz-h5 text-accent">£{carbonData.savings.monthlyMoney}</div>
              <div className="zz-p3 text-muted-foreground">monthly savings</div>
            </div>
            <div className="text-center zz-card">
              <div className="zz-h5 text-accent">£{carbonData.savings.monthlyMoney * 12}</div>
              <div className="zz-p3 text-muted-foreground">annual savings</div>
            </div>
          </>
        )}
        
        {currentView === 'local' && (
          <>
            <div className="text-center zz-card">
              <div className="zz-h5 text-accent">{localBusinesses.length}</div>
              <div className="zz-p3 text-muted-foreground">local options</div>
            </div>
            <div className="text-center zz-card">
              <div className="zz-h5 text-accent">2mi</div>
              <div className="zz-p3 text-muted-foreground">search radius</div>
            </div>
          </>
        )}
        
        {currentView === 'partners' && (
          <>
            <div className="text-center zz-card">
              <div className="zz-h5 text-accent">{partnerOffers.length}</div>
              <div className="zz-p3 text-muted-foreground">active offers</div>
            </div>
            <div className="text-center zz-card">
              <div className="zz-h5 text-accent">20%</div>
              <div className="zz-p3 text-muted-foreground">avg discount</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}