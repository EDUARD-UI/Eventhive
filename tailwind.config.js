/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#007BFF',
          dark: '#0060cc',
          light: '#e8f2ff',
        },
        accent: {
          DEFAULT: '#FFC107',
          dark: '#d9a406',
        },
        navy: {
          DEFAULT: '#0a1838',
          950: '#060d1e',
          900: '#081028',
          800: '#0a1838',
          700: '#0b1a3d',
          600: '#0d2352',
        },
        ink: '#212529',
        muted: '#69707a',
        surface: '#ffffff',
        bg: '#f5f7fa',
        borderc: '#e6e9ef',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(33,37,41,.06), 0 1px 1px rgba(33,37,41,.04)',
        md: '0 10px 24px -8px rgba(33,37,41,.16)',
        lg: '0 24px 48px -12px rgba(33,37,41,.24)',
        card: '0 2px 10px -2px rgba(10, 24, 56, 0.05), 0 1px 3px rgba(10, 24, 56, 0.03)',
        'card-hover': '0 20px 36px -10px rgba(10, 24, 56, 0.12), 0 4px 10px -2px rgba(10, 24, 56, 0.04)',
        glow: '0 0 25px rgba(0, 123, 255, 0.2)',
        'glow-gold': '0 0 25px rgba(255, 193, 7, 0.25)',
      },
      borderRadius: {
        card: '14px',
        sm: '8px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
