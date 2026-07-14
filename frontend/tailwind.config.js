/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#212121',
          sidebar: '#171717',
          card: '#2f2f2f',
          border: 'rgba(255, 255, 255, 0.08)',
          input: '#2f2f2f',
        },
        primary: {
          DEFAULT: '#ffffff',
          hover: '#e5e5e5',
        },
      },
      animation: {
        'bounce-dot': 'bounce-dot 1.4s infinite ease-in-out both',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
      keyframes: {
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
