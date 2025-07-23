import { motion } from 'framer-motion';
import { ThemeToggle } from '../ThemeToggle';
import { OnboardingData } from '../onboarding/OnboardingFlow';

interface DashboardTopBarProps {
  userData: OnboardingData;
  isDark: boolean;
  onThemeToggle: () => void;
  onReset: () => void;
}

export function DashboardTopBar({ userData, isDark, onThemeToggle, onReset }: DashboardTopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
      style={{
        background: 'var(--zz-bg)',
        borderBottom: '1px solid var(--zz-grey)'
      }}
    >
      <div className="flex items-center justify-between p-4" style={{
        border: 'none',
        stroke: 'none',
        color: 'inherit',
        background: 'transparent'
      }}>
        {/* Space for balance */}
        <div style={{ width: '40px' }}></div>

        {/* Center - Theme Toggle */}
        <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />

        {/* Settings */}
        <button
          onClick={onReset}
          style={{
            width: '40px',
            height: '40px',
            fontSize: 'var(--text-medium)',
            border: 'none',
            background: 'transparent',
            color: 'var(--zz-text)',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--duration-normal) var(--ease-out)',
            fontFamily: 'Roboto, sans-serif'
          }}
          title="settings and reset"
        >
          ⚙
        </button>
      </div>
    </motion.div>
  );
}