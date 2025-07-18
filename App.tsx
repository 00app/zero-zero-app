import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroAnimation } from './components/intro/IntroAnimation';
import { OnboardingFlow, OnboardingData } from './components/onboarding/OnboardingFlow';
import { Dashboard } from './components/dashboard/Dashboard';


type AppState = 'intro' | 'onboarding' | 'dashboard';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('intro');
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize app 
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Zero Zero: Initializing app...');
      
      try {
        // Try to initialize database if Supabase is available
        const { getSupabaseStatus, initializeDatabase, checkApiHealth } = await import('./services/supabase');
        
        const supabaseStatus = getSupabaseStatus();
        
        if (supabaseStatus.isConfigured) {
          setIsInitializing(true);
          console.log('🔗 Zero Zero: Initializing with live Supabase connection...');
          
          try {
            // Initialize database schema
            await initializeDatabase();
            
            // Check API health
            const healthCheck = await checkApiHealth();
            console.log('🔍 API Health Check:', healthCheck);
            
            console.log('✅ Zero Zero: Live database connection ready');
          } catch (error) {
            console.error('❌ Zero Zero: Database initialization failed:', error);
            console.log('📱 Zero Zero: Falling back to mock data mode');
          } finally {
            setIsInitializing(false);
          }
        } else {
          console.log('📱 Zero Zero: Running in mock data mode');
          console.log('💡 To enable live database: Add your Supabase credentials to .env');
        }
      } catch (error) {
        console.log('📱 Zero Zero: Supabase service not available, running in basic mode');
        console.error('Service import error:', error);
      }
    };

    // Small delay to let the app settle before initializing
    const timer = setTimeout(initializeApp, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--zz-bg', '#000000');
      root.style.setProperty('--zz-text', '#FFFFFF');
      root.style.setProperty('--zz-accent', '#FFFFFF');
      root.style.setProperty('--zz-card', '#242424');
      root.style.setProperty('--zz-border', '#242424');
      root.style.setProperty('--zz-grey', '#242424');
    } else {
      root.style.setProperty('--zz-bg', '#FFFFFF');
      root.style.setProperty('--zz-text', '#000000');
      root.style.setProperty('--zz-accent', '#000000');
      root.style.setProperty('--zz-card', '#FFFFFF');
      root.style.setProperty('--zz-border', '#000000');
      root.style.setProperty('--zz-grey', '#242424');
    }
  }, [isDark]);

  const handleIntroComplete = () => {
    setCurrentState('onboarding');
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    setUserData(data);
    setCurrentState('dashboard');
  };

  const handleReset = () => {
    setUserData(null);
    setCurrentState('intro');
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Show initialization loading screen if needed
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ 
        background: 'var(--zz-bg)', 
        color: 'var(--zz-text)',
        fontFamily: 'Roboto, sans-serif'
      }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="zz-large mb-4"
          style={{ lineHeight: 1.2 }}
        >
          initializing...
        </motion.div>
        
        <div className="zz-small opacity-60 text-center max-w-sm" style={{ lineHeight: 1.4 }}>
          <div className="mb-2">setting up your zero zero database</div>
          <div>this will only take a moment</div>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--zz-accent)' }}>
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              className="w-full h-full rounded-full"
              style={{ background: 'var(--zz-accent)' }}
            />
          </div>
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--zz-accent)' }}>
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-full h-full rounded-full"
              style={{ background: 'var(--zz-accent)' }}
            />
          </div>
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--zz-accent)' }}>
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-full h-full rounded-full"
              style={{ background: 'var(--zz-accent)' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'var(--zz-bg)', 
      color: 'var(--zz-text)',
      fontFamily: 'Roboto, sans-serif'
    }}>

      
      <AnimatePresence mode="wait">
        {currentState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <IntroAnimation 
              onComplete={handleIntroComplete}
              isDark={isDark}
              onThemeToggle={toggleTheme}
            />
          </motion.div>
        )}
        
        {currentState === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <OnboardingFlow 
              onComplete={handleOnboardingComplete}
              isDark={isDark}
              onThemeToggle={toggleTheme}
            />
          </motion.div>
        )}
        
        {currentState === 'dashboard' && userData && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Dashboard 
              userData={userData}
              isDark={isDark}
              onReset={handleReset}
              onThemeToggle={toggleTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Simple toast container for notifications */}
      <div 
        id="toast-container" 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        style={{ 
          fontFamily: 'Roboto, sans-serif',
          fontSize: '14px',
          lineHeight: '1.2'
        }}
      />
    </div>
  );
}