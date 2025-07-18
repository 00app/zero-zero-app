import { motion } from 'framer-motion';
import { ThemeToggle } from '../ThemeToggle';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface DashboardHeaderProps {
  userData: OnboardingData;
  isDark: boolean;
  onThemeToggle: () => void;
  onReset: () => void;
}

export function DashboardHeader({ userData, isDark, onThemeToggle, onReset }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm mx-auto px-6 py-8"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="zz-large" style={{ lineHeight: 1.2 }}>
          zero zero
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
          
          <button
            onClick={onReset}
            className="zz-circle-button"
            style={{
              width: '48px',
              height: '48px',
              fontSize: 'var(--text-medium)',
              border: '2px solid var(--zz-border)',
              background: 'transparent',
              color: 'var(--zz-text)',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--duration-normal) var(--ease-out)'
            }}
            title="reset and start over"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <div className="zz-medium opacity-60" style={{ lineHeight: 1.3 }}>
          welcome back, {userData.name}
        </div>
        
        <div className="zz-small opacity-40" style={{ lineHeight: 1.3 }}>
          {userData.postcode && `${userData.postcode} • `}
          living sustainably since today
        </div>
      </div>
    </motion.div>
  );
}