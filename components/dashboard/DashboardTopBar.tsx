import { motion } from 'framer-motion';
import { ZaiChat } from './ZaiChat';
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
      className="sticky top-0 z-30 w-full"
      style={{
        background: 'var(--zz-bg)',
        borderBottom: '2px solid var(--zz-border)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <div className="zz-medium" style={{ lineHeight: 1.2 }}>
          zero zero
        </div>

        {/* Center - Theme Toggle */}
        <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />

        {/* Settings */}
        <button
          onClick={onReset}
          className="zz-circle-button"
          style={{
            width: '40px',
            height: '40px',
            fontSize: 'var(--text-small)',
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
          title="settings and reset"
        >
          ⚙
        </button>
      </div>

      {/* Zai Chat - positioned absolutely */}
      <ZaiChat userData={userData} isDark={isDark} />
    </motion.div>
  );
}