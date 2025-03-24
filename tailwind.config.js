/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3399ff',
          DEFAULT: '#3399ff',
          dark: '#2970b8'
        },
        secondary: {
          light: '#66bb6a',
          DEFAULT: '#66bb6a',
          dark: '#4c8c4f'
        },
        background: {
          light: '#f8fafc',
          DEFAULT: '#1a1a1a',
          dark: '#0d1117'
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3399ff 0%, #66bb6a 100%)'
      }
    },
  },
  plugins: [],
};