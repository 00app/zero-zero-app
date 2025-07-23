import { motion } from 'framer-motion';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button 
      onClick={onToggle}
      style={{
        width: '48px',
        height: '48px',
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
      title={isDark ? 'switch to light mode' : 'switch to dark mode'}
    >
      <motion.span
        key={isDark ? 'dark' : 'light'}
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: 90 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: 'var(--text-medium)',
          lineHeight: 1,
          fontWeight: 'var(--font-regular)'
        }}
      >
        {isDark ? '○' : '●'}
      </motion.span>
    </button>
  );
}