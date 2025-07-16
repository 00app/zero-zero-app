
import React, { useState, useEffect } from 'react';
import { OnboardingData } from '../onboarding/OnboardingFlow';
import { calculateCarbonFootprint } from '../../services/carbonCalculations';
import { FloatingActionButtons } from './FloatingActionButtons';
import { Settings } from './Settings';
import { ZaiChatModal } from './ZaiChatModal';
import { TaskCardsSection } from './TaskCardsSection';

interface DashboardProps {
  userData: OnboardingData;
  isDark: boolean;
  onReset?: () => void;
  onThemeToggle?: () => void;
}

interface Card {
  id: string;
  title: string;
  value: string;
  description: string;
  category: 'carbon' | 'money' | 'local' | 'impact' | 'tips' | 'goals';
  action?: string;
  trend?: 'up' | 'down' | 'stable';
  priority: number;
}

export function Dashboard({ userData, isDark, onReset, onThemeToggle }: DashboardProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [isZaiChatOpen, setIsZaiChatOpen] = useState(false);

  const footprint = calculateCarbonFootprint(userData);

  useEffect(() => {
    // Simulate loading for smooth transition
    setTimeout(() => {
      const generatedCards: Card[] = [
        {
          id: 'carbon-total',
          title: 'annual footprint',
          value: `${footprint.total.toFixed(1)} tonnes`,
          description: `${footprint.grade} grade — ${footprint.comparison.reduction > 0 ? 
            `${footprint.comparison.reduction.toFixed(1)} tonnes below` : 
            `${Math.abs(footprint.comparison.reduction).toFixed(1)} tonnes above`} national average`,
          category: 'carbon',
          trend: footprint.comparison.reduction > 0 ? 'down' : 'up',
          priority: 1
        },
        {
          id: 'carbon-home',
          title: 'home emissions',
          value: `${footprint.breakdown.home.toFixed(1)} tonnes`,
          description: `from ${userData.energySource} energy in ${userData.homeType}`,
          category: 'carbon',
          action: 'reduce energy use',
          priority: 2
        },
        {
          id: 'carbon-transport',
          title: 'transport emissions',
          value: `${footprint.breakdown.transport.toFixed(1)} tonnes`,
          description: `from ${userData.transport} travel`,
          category: 'carbon',
          action: userData.transport === 'car' ? 'try alternatives' : 'keep it up',
          priority: 3
        },
        {
          id: 'money-monthly',
          title: 'monthly spend',
          value: `£${userData.monthlySpend.toLocaleString()}`,
          description: 'current lifestyle cost',
          category: 'money',
          priority: 4
        },
        {
          id: 'money-savings',
          title: 'potential savings',
          value: `£${Math.floor(userData.monthlySpend * 0.15).toLocaleString()}/mo`,
          description: 'through sustainable choices',
          category: 'money',
          action: 'explore options',
          trend: 'down',
          priority: 5
        },
        {
          id: 'local-area',
          title: 'your area',
          value: userData.postcode,
          description: 'location-based insights',
          category: 'local',
          action: 'find local options',
          priority: 6
        },
        {
          id: 'impact-comparison',
          title: 'vs peers',
          value: footprint.total < 8 ? 'top 30%' : footprint.total < 12 ? 'average' : 'above average',
          description: `compared to similar households`,
          category: 'impact',
          trend: footprint.total < 8 ? 'down' : 'up',
          priority: 7
        },
        {
          id: 'goals-count',
          title: 'active goals',
          value: userData.goals.length.toString(),
          description: userData.goals.slice(0, 2).join(', ') + (userData.goals.length > 2 ? '...' : ''),
          category: 'goals',
          action: 'track progress',
          priority: 8
        }
      ];

      setCards(generatedCards.sort((a, b) => a.priority - b.priority));
      setIsLoading(false);
    }, 800);
  }, [userData, footprint]);

  const handleCardClick = (card: Card) => {
    setSelectedCard(selectedCard?.id === card.id ? null : card);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const handleSettings = () => {
    setCurrentView('settings');
  };

  const handleZaiChat = () => {
    setIsZaiChatOpen(true);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleDataReset = () => {
    if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      localStorage.removeItem('zz-user-data');
      if (onReset) {
        onReset();
      }
    }
  };

  const getCategoryColor = (category: Card['category']) => {
    const colors = {
      carbon: 'opacity-80',
      money: 'opacity-90',
      local: 'opacity-85',
      impact: 'opacity-75',
      tips: 'opacity-85',
      goals: 'opacity-90'
    };
    return colors[category];
  };

  // Settings view
  if (currentView === 'settings') {
    return (
      <Settings
        userData={userData}
        isDark={isDark}
        onThemeToggle={onThemeToggle || (() => {})}
        onDataReset={handleDataReset}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-all duration-500">
        <div className="text-center space-y-4">
          <div className="zz-fade-in">
            <h2 className="zz-h2">calculating your impact</h2>
          </div>
          <div className="zz-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-48 h-1 bg-current opacity-20 mx-auto">
              <div className="h-full bg-current animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-500">
      
      {/* Header - Clean floating text without background */}
      <div className="sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="zz-h1">hello {userData.name}</h1>
              <p className="zz-p1 opacity-60 mt-2">your sustainability dashboard</p>
            </div>
            <div className="text-right">
              <div className="zz-p1 opacity-60">
                {new Date().toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        
        {/* Task Cards Section */}
        <div className="mb-16">
          <TaskCardsSection userData={userData} />
        </div>

        {/* Overview Cards Grid */}
        <div className="mb-8">
          <h2 className="zz-h2 mb-4">your impact overview</h2>
          <p className="zz-p1 opacity-60 mb-8">detailed metrics and insights</p>
        </div>

        <div className="zz-card-grid">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`zz-card cursor-pointer transform transition-all duration-300 hover:scale-102 ${
                getCategoryColor(card.category)
              } ${selectedCard?.id === card.id ? 'ring-2 ring-current' : ''}`}
              onClick={() => handleCardClick(card)}
              style={{ 
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="zz-h3">{card.title}</h3>
                  {card.trend && (
                    <span className={`text-sm ${
                      card.trend === 'down' ? 'opacity-60' : 
                      card.trend === 'up' ? 'opacity-80' : 'opacity-50'
                    }`}>
                      {card.trend === 'down' ? '↓' : card.trend === 'up' ? '↑' : '→'}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h2 className="zz-h2">{card.value}</h2>
                  <p className="zz-p1 opacity-70">{card.description}</p>
                </div>
                
                {card.action && (
                  <div className="pt-2">
                    <button className="zz-p1 opacity-60 hover:opacity-100">
                      {card.action} →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButtons
        onReset={handleReset}
        onZaiChat={handleZaiChat}
        onSettings={handleSettings}
      />

      {/* Zai Chat Modal */}
      <ZaiChatModal
        userData={userData}
        isOpen={isZaiChatOpen}
        onClose={() => setIsZaiChatOpen(false)}
      />
    </div>
  );
}
