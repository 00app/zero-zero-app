import { useState, useEffect } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import { carbonCalculator, CarbonFootprint } from '../../services/carbonCalculations';
import { apiService, LocationData, AirQualityData } from '../../services/apiService';
import { DashboardModule } from './Dashboard';
import { TypingText, TypingButton } from '../TypingText';
import { PipProgress } from '../PipProgress';

interface ModuleSwitcherProps {
  currentModule: DashboardModule;
  userData: OnboardingData;
  onModuleChange: (module: DashboardModule) => void;
  onExplore: () => void;
}

export function ModuleSwitcher({ 
  currentModule, 
  userData, 
  onModuleChange, 
  onExplore 
}: ModuleSwitcherProps) {
  const [carbonData, setCarbonData] = useState<CarbonFootprint | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        setLoadingStep('calculating carbon footprint...');
        const footprint = carbonCalculator.calculateFullFootprint(userData);
        setCarbonData(footprint);

        setLoadingStep('getting location data...');
        const location = await apiService.getLocationFromPostcode(userData.postcode);
        setLocationData(location);

        setLoadingStep('checking air quality...');
        const aqi = await apiService.getAirQuality(location.coordinates);
        setAirQuality(aqi);

        setLoadingStep('finalizing...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoadingStep('error loading data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userData]);

  const getModuleData = (module: DashboardModule) => {
    if (!carbonData || !locationData) {
      return {
        title: module,
        value: '...',
        unit: '',
        description: 'loading...',
        color: 'text-muted-foreground'
      };
    }

    switch (module) {
      case 'carbon':
        return {
          title: 'carbon footprint',
          value: carbonData.total.toFixed(1),
          unit: 'tonnes co₂/year',
          description: `${carbonData.total < carbonData.comparisons.countryAverage ? 'below' : 'above'} ${locationData.country} average`,
          color: carbonData.total < carbonData.comparisons.countryAverage ? 'text-green-400' : 'text-accent',
          comparison: `vs ${carbonData.comparisons.countryAverage}t average`,
          emoji: '🌱'
        };

      case 'money':
        return {
          title: 'potential savings',
          value: `£${carbonData.savings.monthlyMoney}`,
          unit: 'per month',
          description: `£${carbonData.savings.monthlyMoney * 12} annually through sustainable choices`,
          color: 'text-yellow-400',
          comparison: `${carbonData.savings.actions.length} action areas identified`,
          emoji: '💰'
        };

      case 'local':
        return {
          title: locationData.city,
          value: airQuality ? airQuality.aqi.toString() : '...',
          unit: 'aqi today',
          description: `air quality: ${airQuality?.level || 'checking...'}`,
          color: airQuality ? (airQuality.aqi <= 50 ? 'text-green-400' : airQuality.aqi <= 100 ? 'text-yellow-400' : 'text-red-400') : 'text-muted-foreground',
          comparison: `3 local businesses nearby`,
          emoji: '🏘️'
        };

      case 'partners':
        return {
          title: 'exclusive offers',
          value: '12',
          unit: 'deals available',
          description: 'partner discounts matching your goals',
          color: 'text-purple-400',
          comparison: 'avg 20% savings',
          emoji: '🤝'
        };

      default:
        return {
          title: module,
          value: '0',
          unit: '',
          description: '',
          color: 'text-muted-foreground',
          emoji: '📊'
        };
    }
  };

  const currentData = getModuleData(currentModule);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-pulse">🔄</div>
          <div className="zz-h3 text-accent">
            <TypingText text={loadingStep} speed={80} />
          </div>
          <div className="zz-p2 text-muted-foreground">
            personalizing your dashboard
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 p-6">
      {/* Main Module Display */}
      <div className="text-center space-y-6">
        <div className="text-4xl mb-4">{currentData.emoji}</div>
        
        <div>
          <h2 className="zz-h4 text-muted-foreground mb-2">{currentData.title}</h2>
          <div className={`zz-h1 ${currentData.color} mb-2`}>
            <TypingText text={currentData.value} speed={100} />
          </div>
          <p className="zz-p2 text-muted-foreground">
            {currentData.unit}
          </p>
        </div>

        <div className="space-y-2">
          <p className="zz-p1 text-muted-foreground max-w-sm mx-auto">
            {currentData.description}
          </p>
          {currentData.comparison && (
            <p className="zz-p3 text-muted-foreground">
              {currentData.comparison}
            </p>
          )}
        </div>
      </div>

      {/* Visual Element Based on Module */}
      <div className="flex justify-center">
        {currentModule === 'carbon' && carbonData && (
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted opacity-20"
              />
              
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 56 * Math.min(carbonData.total / carbonData.comparisons.worldAverage, 1)} ${2 * Math.PI * 56}`}
                className={currentData.color}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl">
                {carbonData.comparisons.animalEquivalent.emoji}
              </div>
              <div className="zz-p3 text-muted-foreground">
                {carbonData.comparisons.animalEquivalent.count}
              </div>
            </div>
          </div>
        )}

        {currentModule === 'money' && carbonData && (
          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div className="text-center zz-card">
              <div className="zz-h5 text-yellow-400">£{carbonData.savings.monthlyMoney}</div>
              <div className="zz-p3 text-muted-foreground">monthly</div>
            </div>
            <div className="text-center zz-card">
              <div className="zz-h5 text-yellow-400">£{carbonData.savings.monthlyMoney * 12}</div>
              <div className="zz-p3 text-muted-foreground">yearly</div>
            </div>
          </div>
        )}

        {currentModule === 'local' && airQuality && (
          <div className="w-48">
            <div className="w-full bg-muted h-4 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min((airQuality.aqi / 200) * 100, 100)}%`,
                  backgroundColor: airQuality.aqi <= 50 ? '#00f8ff' : airQuality.aqi <= 100 ? '#90EE90' : '#FFA500'
                }}
              ></div>
            </div>
            <div className="flex justify-between zz-p3 text-muted-foreground mt-2">
              <span>good</span>
              <span>hazardous</span>
            </div>
          </div>
        )}

        {currentModule === 'partners' && (
          <div className="grid grid-cols-3 gap-3">
            {['octopus', 'lime', 'too good to go'].map((partner, index) => (
              <div key={partner} className="text-center zz-card">
                <div className="w-8 h-8 bg-accent/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="zz-p3 text-accent">{partner[0].toUpperCase()}</span>
                </div>
                <div className="zz-p3 text-muted-foreground">{partner}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <TypingButton
          onClick={onExplore}
          startTyping={true}
          speed={60}
          delay={1000}
          className="px-8 py-3"
        >
          explore {currentModule} insights
        </TypingButton>
      </div>

      {/* Module Navigation Indicators */}
      <div className="flex justify-center space-x-8">
        {(['carbon', 'money', 'local', 'partners'] as DashboardModule[]).map((module) => (
          <button
            key={module}
            onClick={() => onModuleChange(module)}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              module === currentModule ? 'text-accent' : 'text-muted-foreground'
            } hover:text-accent`}
          >
            <div className={`pip ${
              module === currentModule ? 'active' : ''
            }`} />
            <span className="zz-p3">{module}</span>
          </button>
        ))}
      </div>

      <div className="text-center">
        <p className="zz-p3 text-muted-foreground">
          tap modules above • swipe ← → to switch • tap button to explore
        </p>
      </div>
    </div>
  );
}