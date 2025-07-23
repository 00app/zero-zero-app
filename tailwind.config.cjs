module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl: '2rem'
      },
      colors: {
        'zz-black': '#000000',
        'zz-white': '#ffffff',
        'zz-grey': '#242424'
      }
    },
  },
  plugins: [],
};