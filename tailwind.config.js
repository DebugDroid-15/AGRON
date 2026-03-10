/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00D4FF',
        'neon-green': '#00FF9C',
        'neon-pink': '#FF006E',
        'neon-purple': '#B537F2',
        'dark-bg': '#030303',
        'dark-secondary': '#0a0a0a',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 156, 0.5)',
        'glow': '0 0 30px rgba(0, 212, 255, 0.3)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-custom': 'pulse-custom 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 50px rgba(0, 212, 255, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'pulse-custom': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
