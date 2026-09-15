/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lavender: '#EEE9FB',
          pattern: '#8B7AD1',
          purple: {
            DEFAULT: '#6D28D9',
            50: '#F5F0FF',
            100: '#E4DAFF',
            200: '#C4B5FD',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6D28D9',
            800: '#5B21B6',
            900: '#4C1D95',
          },
          amber: {
            DEFAULT: '#F59E0B',
            50: '#FFFBEB',
            100: '#FFF8E7',
            200: '#FDE9B6',
            500: '#F59E0B',
            600: '#D97706',
          },
          green: {
            DEFAULT: '#059669',
            50: '#ECFDF5',
            500: '#10B981',
            600: '#059669',
          },
          teal: {
            DEFAULT: '#0891B2',
            50: '#ECFEFF',
            600: '#0891B2',
          },
          orange: {
            DEFAULT: '#EA580C',
            50: '#FFF7ED',
            600: '#EA580C',
          }
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(109, 40, 217, 0.06)',
        'card-hover': '0 8px 30px rgba(109, 40, 217, 0.12)',
        'pill': '0 2px 8px rgba(109, 40, 217, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        'dashboard': '1140px',
      }
    },
  },
  plugins: [],
}
