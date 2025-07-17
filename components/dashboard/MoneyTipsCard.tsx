import React, { useState, useEffect, useRef } from 'react';
import type { OnboardingData } from '../onboarding/OnboardingFlow';

interface MoneyTip {
  id: number;
  title: string;
  description: string;
  estimated_savings: number;
  category: string;
  ai_expand: boolean;
}

interface MoneyTipsData {
  source: string;
  version: string;
  currency: string;
  tips: MoneyTip[];
}

interface MoneyTipsCardProps {
  userData: OnboardingData;
  isDark: boolean;
  onZaiChat?: (message: string) => void;
}

// Category configuration with monochrome icons only
const CATEGORY_CONFIG = {
  energy: { icon: '⚡', label: 'energy' },
  food: { icon: '→', label: 'food' },
  home: { icon: '↓', label: 'home' },
  diet: { icon: '⋮', label: 'diet' },
  ai: { icon: '±', label: 'ai' },
  transport: { icon: '→', label: 'transport' },
  finance: { icon: '±', label: 'finance' },
  shopping: { icon: '↓', label: 'shopping' }
} as const;

// Mock data fallback
const MOCK_TIPS: MoneyTipsData = {
  "source": "Zero Zero Clean Living Tips",
  "version": "1.0",
  "currency": "GBP",
  "tips": [
    {
      "id": 1,
      "title": "switch to renewable energy",
      "description": "cut monthly bills and carbon footprint with 100% renewable electricity providers",
      "estimated_savings": 120,
      "category": "energy",
      "ai_expand": true
    },
    {
      "id": 2,
      "title": "ai meal planning",
      "description": "use ai to plan meals based on what's in your fridge. reduce waste every week",
      "estimated_savings": 300,
      "category": "food",
      "ai_expand": true
    },
    {
      "id": 3,
      "title": "refill, don't rebuy",
      "description": "switch to refillable products from local eco stores. cut plastic and save",
      "estimated_savings": 75,
      "category": "home",
      "ai_expand": false
    },
    {
      "id": 4,
      "title": "air-dry clothes",
      "description": "ditch the tumble dryer. saves money and extends clothing lifespan",
      "estimated_savings": 60,
      "category": "energy",
      "ai_expand": false
    },
    {
      "id": 5,
      "title": "personalised local offers",
      "description": "zai finds deals and cashback near you — tailored to your profile",
      "estimated_savings": 150,
      "category": "ai",
      "ai_expand": true
    }
  ]
};

export function MoneyTipsCard({ userData, isDark, onZaiChat }: MoneyTipsCardProps) {
  const [tips, setTips] = useState<MoneyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedTips, setSavedTips] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load money tips data
  useEffect(() => {
    loadMoneyTips();
    loadSavedTips();
  }, []);

  const loadMoneyTips = async () => {
    try {
      const response = await fetch('/data/money-tips.json');
      if (response.ok) {
        const data: MoneyTipsData = await response.json();
        setTips(data.tips);
        console.log('✅ money tips loaded successfully');
      } else {
        throw new Error(`http error! status: ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ failed to load money tips from server, using mock data:', error);
      setTips(MOCK_TIPS.tips);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedTips = () => {
    try {
      const saved = localStorage.getItem('zz-saved-tips');
      if (saved) {
        setSavedTips(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.warn('Failed to load saved tips:', error);
    }
  };

  const saveTipsToStorage = (newSavedTips: Set<number>) => {
    try {
      localStorage.setItem('zz-saved-tips', JSON.stringify(Array.from(newSavedTips)));
    } catch (error) {
      console.warn('Failed to save tips:', error);
    }
  };

  // Filter tips by category
  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  // Get unique categories from tips
  const availableCategories = ['all', ...new Set(tips.map(tip => tip.category))];

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    if (category === selectedCategory) return;
    
    setIsAnimating(true);
    setSelectedCategory(category);
    setCurrentIndex(0);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Handle tip saving/unsaving
  const handleSaveTip = (tipId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSavedTips = new Set(savedTips);
    
    if (savedTips.has(tipId)) {
      newSavedTips.delete(tipId);
    } else {
      newSavedTips.add(tipId);
    }
    
    setSavedTips(newSavedTips);
    saveTipsToStorage(newSavedTips);
  };

  // Handle Zai chat expansion
  const handleZaiExpand = (tip: MoneyTip, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onZaiChat) {
      const message = `tell me more about "${tip.title.toLowerCase()}" - how can i save £${tip.estimated_savings} per year? give me specific steps for someone living in ${userData.postcode} with a ${userData.homeType} and ${userData.transport} transport.`;
      onZaiChat(message);
    }
  };

  // Handle swipe navigation
  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || filteredTips.length <= 1) return;
    
    setIsAnimating(true);
    
    if (direction === 'left' && currentIndex < filteredTips.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handleSwipe('right');
      } else if (event.key === 'ArrowRight') {
        handleSwipe('left');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, filteredTips.length, isAnimating]);

  // Get savings level for styling
  const getSavingsLevel = (savings: number): 'small' | 'medium' | 'high' => {
    if (savings <= 100) return 'small';
    if (savings <= 250) return 'medium';
    return 'high';
  };

  // Get category info
  const getCategoryInfo = (category: string) => {
    return CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || 
           { icon: '→', label: category };
  };

  if (loading) {
    return (
      <div className="zz-task-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="zz-large">money tips</h3>
          <div className="w-6 h-6 border-2 border-current border-t-transparent animate-spin opacity-60"></div>
        </div>
        <div className="space-y-4">
          <div className="h-32 border-2 border-current animate-pulse opacity-30"></div>
          <div className="h-8 border-2 border-current animate-pulse opacity-20"></div>
        </div>
      </div>
    );
  }

  if (filteredTips.length === 0) {
    return (
      <div className="zz-task-card p-6">
        <h3 className="zz-large mb-6">money tips</h3>
        <div className="text-center py-8">
          <div className="zz-medium opacity-60">
            no tips available for selected category
          </div>
        </div>
      </div>
    );
  }

  const currentTip = filteredTips[currentIndex];
  const categoryInfo = getCategoryInfo(currentTip.category);
  const savingsLevel = getSavingsLevel(currentTip.estimated_savings);

  return (
    <div className="zz-task-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="zz-large">money tips</h3>
        <div className="flex items-center gap-2">
          <span className="zz-small opacity-60">
            {currentIndex + 1} of {filteredTips.length}
          </span>
          <span className="zz-medium">→</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <div className="zz-small opacity-70">filter by category</div>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => {
            const categoryInfo = category === 'all' 
              ? { icon: '→', label: 'all' }
              : getCategoryInfo(category);
            
            return (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`zz-pill ${
                  selectedCategory === category ? 'selected' : ''
                }`}
              >
                <span>{categoryInfo.icon}</span>
                <span>{categoryInfo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tip Card */}
      <div className="relative">
        <div 
          className={`zz-card transition-all duration-300 ${
            isAnimating ? 'opacity-70 scale-98' : 'opacity-100 scale-100'
          }`}
          style={{ minHeight: '280px' }}
        >
          {/* Category Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="zz-medium">{categoryInfo.icon}</span>
              <span className="zz-small opacity-70">{categoryInfo.label}</span>
            </div>
            
            {/* Save Button */}
            <button
              onClick={(e) => handleSaveTip(currentTip.id, e)}
              className={`zz-circle-button ${
                savedTips.has(currentTip.id) ? 'selected' : ''
              }`}
            >
              <span className="zz-medium">
                {savedTips.has(currentTip.id) ? '±' : '→'}
              </span>
            </button>
          </div>

          {/* Savings Amount */}
          <div className="mb-4">
            <div className="inline-flex items-baseline gap-1">
              <span className="zz-large">£{currentTip.estimated_savings}</span>
              <span className="zz-small opacity-80">per year</span>
            </div>
          </div>

          {/* Title */}
          <h4 className="zz-large mb-3 leading-tight">
            {currentTip.title.toLowerCase()}
          </h4>

          {/* Description */}
          <p className="zz-medium opacity-80 mb-6 leading-relaxed">
            {currentTip.description.toLowerCase()}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {currentTip.ai_expand && (
              <button
                onClick={(e) => handleZaiExpand(currentTip, e)}
                className="zz-pill selected"
              >
                <span className="zz-small">→</span>
                <span className="zz-small">ask zai</span>
              </button>
            )}
            
            <div className="zz-small opacity-50">
              {currentTip.ai_expand ? 'ai-enhanced tip' : 'quick tip'}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {filteredTips.length > 1 && (
          <>
            <button
              onClick={() => handleSwipe('right')}
              disabled={currentIndex === 0 || isAnimating}
              className="absolute left-4 top-1/2 -translate-y-1/2 zz-circle-button"
            >
              <span className="zz-medium">←</span>
            </button>
            
            <button
              onClick={() => handleSwipe('left')}
              disabled={currentIndex === filteredTips.length - 1 || isAnimating}
              className="absolute right-4 top-1/2 -translate-y-1/2 zz-circle-button"
            >
              <span className="zz-medium">→</span>
            </button>
          </>
        )}
      </div>

      {/* Progress Dots */}
      {filteredTips.length > 1 && (
        <div className="flex justify-center gap-2">
          {filteredTips.map((_, index) => (
            <button
              key={index}
              onClick={() => !isAnimating && setCurrentIndex(index)}
              className={`zz-progress-dot ${
                index === currentIndex ? 'active' : ''
              }`}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="border-t border-current pt-4 opacity-60">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="zz-medium">
              £{tips.reduce((sum, tip) => sum + tip.estimated_savings, 0)}
            </div>
            <div className="zz-small opacity-60">total potential</div>
          </div>
          <div>
            <div className="zz-medium">
              {savedTips.size}
            </div>
            <div className="zz-small opacity-60">saved tips</div>
          </div>
          <div>
            <div className="zz-medium">
              {tips.filter(tip => tip.ai_expand).length}
            </div>
            <div className="zz-small opacity-60">ai-enhanced</div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="zz-small opacity-40 text-center">
        <p>swipe or use arrow keys to navigate • tap → to save tips</p>
        {onZaiChat && <p className="mt-1">tap "ask zai" for personalised advice</p>}
      </div>
    </div>
  );
}