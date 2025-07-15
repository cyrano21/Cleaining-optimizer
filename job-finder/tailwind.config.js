/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './app/components/**/*.{js,ts,jsx,tsx}',
    './app/modules/**/*.{js,ts,jsx,tsx}',
    './node_modules/tw-animate-css/**/*.{js,css}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          50: '#F5EEFF',
          100: '#EADFFF',
          200: '#D0BFFC',
          300: '#B395F7',
          400: '#8B5CF6',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#3B0764'
        },
        accent: {
          DEFAULT: '#EC4899',
          50: '#FFF1F7',
          100: '#FFE6EE',
          200: '#FFCCE1',
          300: '#FFA3C3',
          400: '#EC4899',
          500: '#DB2777',
          600: '#BE185D',
          700: '#9D174D',
          800: '#831843',
          900: '#500724'
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      borderRadius: {
        lg: '1rem'
      },
      boxShadow: {
        card: '0 4px 14px rgba(0, 0, 0, 0.1)'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out'
      }
    }
  },
  plugins: []
};
