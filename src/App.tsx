// This file is being removed to fix build conflicts
// The main App.tsx is in the root directory
// REMOVING THIS FILE
import { OnboardingFlow, OnboardingData } from './components/onboarding/OnboardingFlow';
import { Dashboard } from './components/dashboard/Dashboard';
import { GlitchIntro } from './components/GlitchIntro';
import { RSVPAnimation } from './components/RSVPAnimation';
import { CTAButton } from './components/CTAButton';
import { Toaster } from './components/ui/sonner';

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
      {currentPhase === 'glitch' && (
        <GlitchIntro onComplete={handleGlitchComplete} />
      )}
      
      {currentPhase === 'rsvp' && (
        <RSVPAnimation
          text="what if change started with just one small thing?"
          onComplete={handleRSVPComplete}
        />
      )}
      
      {currentPhase === 'cta' && (
        <CTAButton onBegin={handleBegin} />
      )}
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'intro' | 'onboarding' | 'dashboard'>('intro');
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('zz-theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      setIsDark(true);
    }

    const savedData = localStorage.getItem('zz-user-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.name && parsedData.postcode) {
          setUserData(parsedData);
          setCurrentScreen('dashboard');
        }
      } catch (error) {
        console.warn('invalid saved user data, clearing:', error);
        localStorage.removeItem('zz-user-data');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zz-theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('light', !isDark);
    document.documentElement.classList.toggle('dark', isDark);
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

  const resetApp = () => {
    localStorage.removeItem('zz-user-data');
    setUserData(null);
    handleScreenTransition(() => setCurrentScreen('intro'));
  };

  return (
    <div className={`min-h-screen transition-all duration-400 ease-out ${
      isTransitioning ? 'opacity-70 scale-99' : 'opacity-100 scale-100'
    } ${!isDark ? 'light' : 'dark'}`}>
      
      <div className="fixed top-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="zz-p1 opacity-50 hover:opacity-100 transition-all duration-300"
          style={{ textDecoration: 'none' }}
          aria-label={`switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          {isDark ? '○' : '●'}
        </button>
      </div>
      
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

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#242424' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000',
            border: `2px solid ${isDark ? '#242424' : '#242424'}`,
            fontSize: '16px',
            fontFamily: 'Roboto, sans-serif',
            borderRadius: '0',
            textTransform: 'lowercase'
          },
        }}
      />
    </div>
  );
}