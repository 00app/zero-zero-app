
import { useState, useEffect } from 'react';
import { OnboardingFlow, OnboardingData } from './components/onboarding/OnboardingFlow';
import { Dashboard } from './components/dashboard/Dashboard';
import { GlitchIntro } from './components/GlitchIntro';
import { RSVPAnimation } from './components/RSVPAnimation';
import { CTAButton } from './components/CTAButton';
import { Toaster } from './components/ui/sonner';
import { getDebugInfo } from './utils/supabase/client';

// Enhanced Intro Screen Component with Glitch + RSVP + CTA
function IntroScreen({ onComplete, isDark }: { onComplete: () => void; isDark: boolean }) {
  const [currentPhase, setCurrentPhase] = useState<'glitch' | 'rsvp' | 'cta'>('glitch');
  const [isExiting, setIsExiting] = useState(false);

  const handleGlitchComplete = () => {
    setCurrentPhase('rsvp');
  };

  const handleRSVPComplete = () => {
    setCurrentPhase('cta');
  };

  const handleBegin = () => {
    setIsExiting(true);
    setTimeout(onComplete, 800);
  };

  return (
    <div className={`min-h-screen bg-black transition-all duration-1000 ease-out ${
      isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}>
      
      {/* Glitch Phase: "ZERO" with effects */}
      {currentPhase === 'glitch' && (
        <GlitchIntro onComplete={handleGlitchComplete} />
      )}
      
      {/* RSVP Phase: Word-by-word animation */}
      {currentPhase === 'rsvp' && (
        <RSVPAnimation
          text="WHAT IF CHANGE STARTED WITH JUST ONE SMALL THING?"
          onComplete={handleRSVPComplete}
        />
      )}
      
      {/* CTA Phase: "Let's Begin" button */}
      {currentPhase === 'cta' && (
        <CTAButton onBegin={handleBegin} />
      )}
    </div>
  );
}

// Debug component to monitor Supabase client usage
function SupabaseDebugInfo() {
  const [debugInfo, setDebugInfo] = useState(getDebugInfo());

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo(getDebugInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (import.meta.env?.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-80 text-white p-3 rounded text-xs">
      <div>Supabase Instances: {debugInfo.instanceCreationCount}</div>
      <div>Has Instance: {debugInfo.hasInstance ? 'Yes' : 'No'}</div>
    </div>
  );
}

// Test user data for development
const testUsers = {
  london: {
    name: 'Alex',
    postcode: 'SW1A 1AA',
    homeType: 'apartment' as const,
    energySource: 'grid' as const,
    transport: 'public' as const,
    carType: undefined,
    rooms: 2,
    people: 1,
    monthlySpend: 2800,
    goals: ['save money', 'reduce waste', 'eat better']
  },
  lisbon: {
    name: 'Maria',
    postcode: '1000-001',
    homeType: 'house' as const,
    energySource: 'renewable' as const,
    transport: 'mixed' as const,
    carType: 'hybrid' as 'petrol' | 'diesel' | 'hybrid' | 'electric',
    rooms: 3,
    people: 2,
    monthlySpend: 2200,
    goals: ['local shopping', 'renewable energy', 'plant diet']
  },
  accra: {
    name: 'Kwame',
    postcode: 'GA-001',
    homeType: 'shared' as const,
    energySource: 'mixed' as const,
    transport: 'public' as const,
    carType: undefined,
    rooms: 1,
    people: 3,
    monthlySpend: 800,
    goals: ['water conservation', 'community action', 'local food']
  },
  watford: {
    name: 'Jamie',
    postcode: 'WD17 1DP',
    homeType: 'house' as const,
    energySource: 'grid' as const,
    transport: 'car' as const,
    carType: 'petrol' as 'petrol' | 'diesel' | 'hybrid' | 'electric',
    rooms: 4,
    people: 4,
    monthlySpend: 3500,
    goals: ['family sustainability', 'home efficiency', 'transport alternatives']
  }
};

// Main App Component
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'intro' | 'onboarding' | 'dashboard'>('intro');
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Check for existing user data and theme on startup
  useEffect(() => {
    // Check theme preference
    const savedTheme = localStorage.getItem('zz-theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      // Default to dark theme (system preference check removed)
      setIsDark(true);
    }

    // Check for test user in URL
    const urlParams = new URLSearchParams(window.location.search);
    const testUser = urlParams.get('dev');
    
    if (testUser && testUsers[testUser as keyof typeof testUsers]) {
      const testData = testUsers[testUser as keyof typeof testUsers];
      setUserData(testData);
      setCurrentScreen('dashboard');
      return;
    }

    // Check for saved user data
    const savedData = localStorage.getItem('zz-user-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.name && parsedData.postcode) {
          setUserData(parsedData);
          setCurrentScreen('dashboard');
        }
      } catch (error) {
        localStorage.removeItem('zz-user-data');
      }
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('zz-theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  const handleScreenTransition = (callback: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 200);
    }, 400);
  };

  const handleIntroComplete = () => {
    handleScreenTransition(() => setCurrentScreen('onboarding'));
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    localStorage.setItem('zz-user-data', JSON.stringify(data));
    setUserData(data);
    handleScreenTransition(() => setCurrentScreen('dashboard'));
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Development controls
  const isDev = import.meta.env?.MODE === 'development';
  const resetApp = () => {
    localStorage.removeItem('zz-user-data');
    setUserData(null);
    handleScreenTransition(() => setCurrentScreen('intro'));
  };

  return (
    <div className={`min-h-screen transition-all duration-400 ease-out ${
      isTransitioning ? 'opacity-70 scale-99' : 'opacity-100 scale-100'
    } ${!isDark ? 'light' : ''}`}>
      
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="zz-p1 opacity-50 hover:opacity-100 transition-all duration-300 no-underline"
          style={{ textDecoration: 'none' }}
        >
          {isDark ? '○' : '●'}
        </button>
      </div>

      {/* Dev Controls */}
      {isDev && (
        <div className="fixed top-20 right-6 z-50 flex space-x-4">
          <button 
            onClick={resetApp} 
            className="zz-p1 opacity-40 hover:opacity-100 transition-opacity duration-200 text-xs"
          >
            reset
          </button>
          <a 
            href="?dev=london" 
            className="zz-p1 opacity-40 hover:opacity-100 transition-opacity duration-200 text-xs"
          >
            london
          </a>
          <a 
            href="?dev=lisbon" 
            className="zz-p1 opacity-40 hover:opacity-100 transition-opacity duration-200 text-xs"
          >
            lisbon
          </a>
          <a 
            href="?dev=accra" 
            className="zz-p1 opacity-40 hover:opacity-100 transition-opacity duration-200 text-xs"
          >
            accra
          </a>
          <a 
            href="?dev=watford" 
            className="zz-p1 opacity-40 hover:opacity-100 transition-opacity duration-200 text-xs"
          >
            watford
          </a>
        </div>
      )}
      
      {/* Screen Content */}
      {currentScreen === 'intro' && (
        <IntroScreen onComplete={handleIntroComplete} isDark={isDark} />
      )}
      
      {currentScreen === 'onboarding' && (
        <OnboardingFlow onComplete={handleOnboardingComplete} isDark={isDark} />
      )}
      
      {currentScreen === 'dashboard' && userData && (
        <Dashboard 
          userData={userData} 
          isDark={isDark} 
          onReset={resetApp}
          onThemeToggle={toggleTheme}
        />
      )}

      {/* Toast Notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#121212' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000',
            border: `1px solid ${isDark ? '#2a2a2a' : '#e5e5e5'}`,
            fontSize: '16px',
            fontFamily: 'Roboto, sans-serif'
          },
        }}
      />

      {/* Supabase Debug Info */}
      <SupabaseDebugInfo />
    </div>
  );
}
