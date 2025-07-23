/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./main.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'zz-black': '#000000',
        'zz-white': '#ffffff',
        'zz-grey': '#242424',
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
      },
      fontSize: {
        'zz-large': '24px',
        'zz-medium': '16px',
        'zz-small': '12px',
      },
      spacing: {
        'zz-xs': '8px',
        'zz-sm': '16px',
        'zz-md': '24px',
        'zz-lg': '32px',
        'zz-xl': '48px',
      },
      animation: {
        'glitch-shake': 'glitch-shake 0.3s infinite linear alternate-reverse',
        'glitch-anim-1': 'glitch-anim-1 0.6s infinite linear alternate-reverse',
        'glitch-anim-2': 'glitch-anim-2 0.8s infinite linear alternate-reverse',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'glitch-shake': {
          '0%': { transform: 'translate(0)' },
          '10%': { transform: 'translate(-2px, -1px)' },
          '20%': { transform: 'translate(-1px, 0px)' },
          '30%': { transform: 'translate(1px, 2px)' },
          '40%': { transform: 'translate(1px, -1px)' },
          '50%': { transform: 'translate(-1px, 1px)' },
          '60%': { transform: 'translate(-1px, 1px)' },
          '70%': { transform: 'translate(1px, 1px)' },
          '80%': { transform: 'translate(-1px, -1px)' },
          '90%': { transform: 'translate(1px, 2px)' },
          '100%': { transform: 'translate(1px, -2px)' },
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}