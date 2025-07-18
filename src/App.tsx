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

  // Initialize app with environment validation
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Zero Zero: Initializing app...');
      
      // Validate environment configuration
      try {
        const { getEnvironmentStatus } = await import('../services/environmentConfig');
        const envStatus = getEnvironmentStatus();
        
        if (envStatus.isFullyConfigured) {
          console.log('✅ Zero Zero: All services configured and ready');
        } else {
          console.warn('⚠️ Zero Zero: Running with partial configuration');
          console.log('Missing services:', Object.entries(envStatus.core).filter(([_, status]) => status.includes('❌')));
        }
      } catch (error) {
        console.warn('⚠️ Zero Zero: Environment validation failed, continuing with defaults');
      }
      
      try {
        // Try to initialize database if Supabase is available
        const { getSupabaseStatus, initializeDatabase, checkApiHealth } = await import('../services/supabase');
        
        const supabaseStatus = getSupabaseStatus();
        
        if (supabaseStatus.isConfigured) {
          setIsInitializing(true);
          console.log('🔗 Zero Zero: Initializing with live Supabase connection...');
          
          try {
            await initializeDatabase();
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

    const timer = setTimeout(initializeApp, 500);
    return () => clearTimeout(timer);
  }, []);

  // Apply theme to CSS variables with proper validation
  useEffect(() => {
    const root = document.documentElement;
    
    // Define theme colors strictly following the 3-color palette
    const darkTheme = {
      '--zz-bg': '#000000',
      '--zz-text': '#ffffff',
      '--zz-accent': '#ffffff',
      '--zz-card': '#242424',
      '--zz-border': '#242424',
      '--zz-grey': '#242424'
    };
    
    const lightTheme = {
      '--zz-bg': '#ffffff',
      '--zz-text': '#000000',
      '--zz-accent': '#000000',
      '--zz-card': '#ffffff',
      '--zz-border': '#242424',
      '--zz-grey': '#242424'
    };
    
    const theme = isDark ? darkTheme : lightTheme;
    
    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Also apply theme class for CSS selectors
    document.body.className = isDark ? 'dark' : 'light';
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

  // Initialization loading screen
  if (isInitializing) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ 
          background: 'var(--zz-bg)', 
          color: 'var(--zz-text)',
          fontFamily: 'Roboto, sans-serif'
        }}
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ 
            fontSize: 'var(--text-large)',
            fontWeight: 'var(--font-regular)',
            lineHeight: 1.2,
            marginBottom: '1rem'
          }}
        >
          initializing...
        </motion.div>
        
        <div 
          style={{ 
            fontSize: 'var(--text-small)',
            opacity: 0.6,
            textAlign: 'center',
            maxWidth: '320px',
            lineHeight: 1.4
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>setting up your zero zero database</div>
          <div>this will only take a moment</div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[0, 0.2, 0.4].map((delay, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--zz-accent)'
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'var(--zz-accent)'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'var(--zz-bg)', 
        color: 'var(--zz-text)',
        fontFamily: 'Roboto, sans-serif'
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
      
      {/* Toast container for notifications */}
      <div 
        id="toast-container" 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        style={{ 
          fontFamily: 'Roboto, sans-serif',
          fontSize: 'var(--text-small)',
          lineHeight: 1.2
        }}
      />
    </div>
  );
}