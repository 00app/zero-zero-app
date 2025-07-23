import { useState, useEffect } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import { carbonCalculator, CarbonFootprint } from '../../services/carbonCalculations';
import { apiService, LocationData, AirQualityData } from '../../services/apiService';

interface CarbonVisualsProps {
  userData: OnboardingData;
  currentView: 'carbon' | 'money' | 'local' | 'partners';
  onViewChange: (view: 'carbon' | 'money' | 'local' | 'partners') => void;
}

type ChartType = 'donut' | 'bar' | 'gauge';

export function CarbonVisuals({ userData, currentView, onViewChange }: CarbonVisualsProps) {
  const [chartType, setChartType] = useState<ChartType>('donut');
  const [carbonData, setCarbonData] = useState<CarbonFootprint | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Calculate carbon footprint
      const footprint = carbonCalculator.calculateFullFootprint(userData);
      setCarbonData(footprint);

      // Get location data
      const location = await apiService.getLocationFromPostcode(userData.postcode);
      setLocationData(location);

      // Get air quality data
      const aqi = await apiService.getAirQuality(location.coordinates);
      setAirQuality(aqi);
    };

    loadData();
  }, [userData]);

  const handleSwipeLeft = () => {
    const charts: ChartType[] = ['donut', 'bar', 'gauge'];
    const currentIndex = charts.indexOf(chartType);
    const nextIndex = (currentIndex + 1) % charts.length;
    setChartType(charts[nextIndex]);
  };

  const handleSwipeRight = () => {
    const charts: ChartType[] = ['donut', 'bar', 'gauge'];
    const currentIndex = charts.indexOf(chartType);
    const prevIndex = currentIndex === 0 ? charts.length - 1 : currentIndex - 1;
    setChartType(charts[prevIndex]);
  };

  const handleSwipeDown = () => {
    const views: ('carbon' | 'money' | 'local' | 'partners')[] = ['carbon', 'money', 'local', 'partners'];
    const currentIndex = views.indexOf(currentView);
    const nextIndex = (currentIndex + 1) % views.length;
    onViewChange(views[nextIndex]);
  };

  if (!carbonData || !locationData || !airQuality) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="zz-h2 text-muted-foreground animate-pulse">calculating...</div>
        </div>
      </div>
    );
  }

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#00f8ff'; // Good - Zai blue
    if (aqi <= 100) return '#90EE90'; // Moderate - Light green
    if (aqi <= 150) return '#FFD700'; // Unhealthy for sensitive - Gold
    if (aqi <= 200) return '#FFA500'; // Unhealthy - Orange
    if (aqi <= 300) return '#FF6347'; // Very unhealthy - Tomato
    return '#8B0000'; // Hazardous - Dark red
  };

  return (
    <div className="space-y-8">
      {/* Animal Comparison - Top of carbon section */}
      {currentView === 'carbon' && (
        <div className="text-center bg-card border border-border zz-radius-lg p-4">
          <div className="zz-h3 mb-2">
            {carbonData.comparisons.animalEquivalent.emoji} × {carbonData.comparisons.animalEquivalent.count}
          </div>
          <p className="zz-p2 text-muted-foreground">
            your carbon footprint weighs as much as {carbonData.comparisons.animalEquivalent.count} {carbonData.comparisons.animalEquivalent.animal}
            {carbonData.comparisons.animalEquivalent.count > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Main Chart Display */}
      <div className="text-center">
        {currentView === 'carbon' && (
          <>
            <h2 className="zz-h2 text-accent">
              {carbonData.total.toFixed(1)} tonnes
            </h2>
            <p className="zz-p2 text-muted-foreground">
              co₂ per year
            </p>
          </>
        )}
        
        {currentView === 'money' && (
          <>
            <h2 className="zz-h2 text-accent">
              £{carbonData.savings.monthlyMoney}
            </h2>
            <p className="zz-p2 text-muted-foreground">
              potential monthly savings
            </p>
          </>
        )}

        {currentView === 'local' && locationData && (
          <>
            <h2 className="zz-h2 text-accent">
              {locationData.city}
            </h2>
            <p className="zz-p2 text-muted-foreground">
              your local area
            </p>
          </>
        )}

        {currentView === 'partners' && (
          <>
            <h2 className="zz-h2 text-accent">
              12
            </h2>
            <p className="zz-p2 text-muted-foreground">
              partner offers available
            </p>
          </>
        )}
      </div>

      <div 
        className="bg-card border border-border zz-radius-lg p-6 min-h-[350px] flex flex-col justify-center items-center space-y-4 touch-manipulation"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const startX = touch.clientX;
          const startY = touch.clientY;
          
          const handleTouchEnd = (endEvent: TouchEvent) => {
            const endTouch = endEvent.changedTouches[0];
            const deltaX = endTouch.clientX - startX;
            const deltaY = endTouch.clientY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
              if (deltaX > 0) {
                handleSwipeRight();
              } else {
                handleSwipeLeft();
              }
            } else if (deltaY > 50) {
              handleSwipeDown();
            }
            
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          document.addEventListener('touchend', handleTouchEnd);
        }}
      >
        {currentView === 'carbon' && chartType === 'donut' && (
          <div className="text-center space-y-6">
            {/* 5-Ring Carbon Donut: World > Country > Region > Local > You */}
            <div className="relative w-64 h-64">
              <svg className="w-full h-full transform -rotate-90">
                {/* World Average Ring */}
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted opacity-20"
                />
                
                {/* Country Average Ring */}
                <circle
                  cx="128"
                  cy="128"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted opacity-30"
                />
                
                {/* Region Average Ring */}
                <circle
                  cx="128"
                  cy="128"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted opacity-40"
                />
                
                {/* Local Average Ring */}
                <circle
                  cx="128"
                  cy="128"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted opacity-50"
                />
                
                {/* Your Emissions Ring */}
                <circle
                  cx="128"
                  cy="128"
                  r="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 30 * Math.min(carbonData.total / carbonData.comparisons.worldAverage, 1)} ${2 * Math.PI * 30}`}
                  className="text-accent"
                />
              </svg>
              
              {/* Center Labels */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="zz-h5 text-accent">{carbonData.total.toFixed(1)}</div>
                <div className="zz-p3 text-muted-foreground">you</div>
              </div>
            </div>
            
            <div className="space-y-2 zz-p3 text-muted-foreground">
              <div>world average: {carbonData.comparisons.worldAverage}t</div>
              <div>{locationData.country}: {carbonData.comparisons.countryAverage}t</div>
              <div>{locationData.region}: {carbonData.comparisons.regionAverage.toFixed(1)}t</div>
            </div>
            
            <div className="zz-p3 text-muted-foreground">
              5-ring donut • swipe ← → for charts
            </div>
          </div>
        )}

        {currentView === 'carbon' && chartType === 'bar' && (
          <div className="space-y-4 w-full max-w-xs">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="zz-p2">home energy</span>
                <span className="zz-p2">{carbonData.breakdown.home.toFixed(1)}t</span>
              </div>
              <div className="w-full bg-muted h-3 rounded">
                <div 
                  className="bg-accent h-3 rounded transition-all duration-1000" 
                  style={{ width: `${(carbonData.breakdown.home / carbonData.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="zz-p2">transport</span>
                <span className="zz-p2">{carbonData.breakdown.transport.toFixed(1)}t</span>
              </div>
              <div className="w-full bg-muted h-3 rounded">
                <div 
                  className="bg-accent h-3 rounded transition-all duration-1000" 
                  style={{ width: `${(carbonData.breakdown.transport / carbonData.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="zz-p2">spending</span>
                <span className="zz-p2">{carbonData.breakdown.spending.toFixed(1)}t</span>
              </div>
              <div className="w-full bg-muted h-3 rounded">
                <div 
                  className="bg-accent h-3 rounded transition-all duration-1000" 
                  style={{ width: `${(carbonData.breakdown.spending / carbonData.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="zz-p2">food</span>
                <span className="zz-p2">{carbonData.breakdown.food.toFixed(1)}t</span>
              </div>
              <div className="w-full bg-muted h-3 rounded">
                <div 
                  className="bg-accent h-3 rounded transition-all duration-1000" 
                  style={{ width: `${(carbonData.breakdown.food / carbonData.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="zz-p3 text-muted-foreground text-center">
              breakdown chart • swipe ← →
            </div>
          </div>
        )}

        {currentView === 'carbon' && chartType === 'gauge' && (
          <div className="text-center space-y-6">
            <div className="relative w-48 h-24">
              <svg className="w-full h-full">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#00f8ff', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#00f8ff', stopOpacity: 0.7 }} />
                    <stop offset="100%" style={{ stopColor: '#00f8ff', stopOpacity: 0.4 }} />
                  </linearGradient>
                </defs>
                
                {/* Background arc */}
                <path
                  d="M 24 72 A 48 48 0 0 1 168 72"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted opacity-20"
                />
                
                {/* Progress arc */}
                <path
                  d={`M 24 72 A 48 48 0 0 1 ${96 + Math.cos(Math.PI - (carbonData.total / carbonData.comparisons.worldAverage) * Math.PI) * 48} ${72 - Math.sin(Math.PI - (carbonData.total / carbonData.comparisons.worldAverage) * Math.PI) * 48}`}
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Needle */}
                <line
                  x1="96"
                  y1="72"
                  x2={96 + Math.cos(Math.PI - (carbonData.total / carbonData.comparisons.worldAverage) * Math.PI) * 40}
                  y2={72 - Math.sin(Math.PI - (carbonData.total / carbonData.comparisons.worldAverage) * Math.PI) * 40}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent"
                />
              </svg>
            </div>
            
            <div>
              <div className="zz-p2 text-muted-foreground">
                vs world average ({carbonData.comparisons.worldAverage}t)
              </div>
              <div className="zz-p1 text-accent">
                {carbonData.total < carbonData.comparisons.worldAverage ? 'below' : 'above'} average
              </div>
            </div>
            
            <div className="zz-p3 text-muted-foreground">
              comparison gauge • swipe ← →
            </div>
          </div>
        )}

        {/* Air Quality Gauge - shown for all views */}
        <div className="w-full border-t border-border pt-6 mt-6">
          <div className="text-center space-y-4">
            <div className="zz-h5">air quality today</div>
            <div className="zz-p2 text-muted-foreground">{locationData.city}</div>
            
            <div className="w-full bg-muted h-4 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min((airQuality.aqi / 200) * 100, 100)}%`,
                  backgroundColor: getAQIColor(airQuality.aqi)
                }}
              ></div>
            </div>
            
            <div className="flex justify-between zz-p3 text-muted-foreground">
              <span>good</span>
              <span className="text-accent">aqi {airQuality.aqi} • {airQuality.level}</span>
              <span>hazardous</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="zz-p3 text-muted-foreground">
          swipe ↓ for {currentView === 'carbon' ? 'money' : currentView === 'money' ? 'local' : currentView === 'local' ? 'partners' : 'carbon'}
        </p>
      </div>
    </div>
  );
}