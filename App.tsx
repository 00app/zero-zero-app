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

  // Initialize app in background
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Zero Zero: Initializing app...');
      
      try {
        // Try to initialize database if Supabase is available
        const { getSupabaseStatus, initializeDatabase, checkApiHealth } = await import('./services/supabase');
        
        const supabaseStatus = getSupabaseStatus();
        
        if (supabaseStatus.isConfigured) {
          console.log('🔗 Zero Zero: Connecting to Supabase...');
          console.log(`   URL: ${supabaseStatus.url}`);
          console.log(`   Mode: ${supabaseStatus.mode}`);
          
          try {
            // Initialize database tables and data
            console.log('📊 Initializing database tables...');
            await initializeDatabase();
            
            // Check API health
            console.log('🔍 Checking API health...');
            const healthCheck = await checkApiHealth();
            console.log('🔍 API Health Check:', healthCheck);
            
            if (healthCheck.status === 'ok') {
              console.log('✅ Zero Zero: Live Supabase connection established');
              console.log('   Database: Ready');
              console.log('   Server: Running');
              console.log('   Tables: Initialized');
            } else {
              console.warn('⚠️ Zero Zero: API health check failed, using fallback mode');
            }
          } catch (error) {
            console.error('❌ Zero Zero: Database initialization failed:', error);
            console.log('📱 Zero Zero: Falling back to mock data mode');
            console.log('   This is normal if running without backend setup');
          }
        } else {
          console.log('📱 Zero Zero: Running in mock data mode');
          console.log('💡 To enable live database connection:');
          console.log('   1. Add VITE_SUPABASE_URL to your .env file');
          console.log('   2. Add VITE_SUPABASE_ANON_KEY to your .env file');
          console.log('   3. Restart the development server');
        }
      } catch (error) {
        console.log('📱 Zero Zero: Supabase service not available, running in basic mode');
        console.error('Service import error:', error);
      }
    };

    // Initialize in background without blocking the UI
    initializeApp();
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--zz-bg', 'var(--zz-black)');
      root.style.setProperty('--zz-text', 'var(--zz-white)');
      root.style.setProperty('--zz-accent', 'var(--zz-white)');
      root.style.setProperty('--zz-card', 'var(--zz-grey)');
      root.style.setProperty('--zz-card-text', 'var(--zz-white)');
      root.style.setProperty('--zz-border', 'var(--zz-grey)');
    } else {
      root.style.setProperty('--zz-bg', 'var(--zz-white)');
      root.style.setProperty('--zz-text', 'var(--zz-black)');
      root.style.setProperty('--zz-accent', 'var(--zz-black)');
      root.style.setProperty('--zz-card', 'var(--zz-white)');
      root.style.setProperty('--zz-card-text', 'var(--zz-black)');
      root.style.setProperty('--zz-border', 'var(--zz-grey)');
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

  return (
    <div 
      style={{ 
        background: 'var(--zz-bg)', 
        color: 'var(--zz-text)',
        fontFamily: 'Roboto, sans-serif',
        minHeight: '100vh',
        fontWeight: 'var(--font-regular)',
        fontSize: 'var(--text-medium)',
        lineHeight: 1.4,
        textTransform: 'lowercase'
      }}
    >
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
      
      {/* Toast container for notifications */}
      <div 
        id="toast-container" 
        style={{ 
          position: 'fixed',
          bottom: 'var(--spacing-sm)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          pointerEvents: 'none',
          fontFamily: 'Roboto, sans-serif',
          fontSize: 'var(--text-small)',
          lineHeight: 1.2,
          textTransform: 'lowercase'
        }}
      />
    </div>
  );
}