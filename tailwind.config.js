/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B132B',
        },
        athleticBlue: {
          DEFAULT: '#1976D2',
          50:      '#E3F2FD',
          100:     '#BBDEFB',
          200:     '#90CAF9',
          700:     '#1565C0',
        },
        energyGreen: {
          DEFAULT: '#43A047',
          50:      '#E8F5E9',
          100:     '#C8E6C9',
          200:     '#A5D6A7',
          400:     '#66BB6A',
          600:     '#43A047',
          700:     '#388E3C',
          800:     '#2E7D32',
        },
        steelGray: {
          DEFAULT: '#607D8B',
          50:      '#ECEFF1',
          100:     '#CFD8DC',
          700:     '#455A64',
        },
        lightGray: '#F1F3F5',
        rapidFill: {
          DEFAULT: '#F4511E',
          50:      '#FEF0EC',
          100:     '#FDD6C8',
          200:     '#FBAD95',
          700:     '#C63E15',
        },
        urgent: {
          50:      '#FFFBEB',
          100:     '#FEF3C7',
          200:     '#FDE68A',
          300:     '#FCD34D',
          500:     '#F59E0B',
          600:     '#D97706',
          700:     '#B45309',
          DEFAULT: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
