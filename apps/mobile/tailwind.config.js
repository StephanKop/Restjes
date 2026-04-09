/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        offwhite: '#faf9f6',
        cream: '#f5f0e8',
        warm: {
          100: '#eeebe7',
          200: '#ddd8d1',
          300: '#c4bdb4',
          400: '#9e9589',
          500: '#736b62',
          600: '#58514a',
          700: '#433d37',
          800: '#302b26',
          900: '#1f1b17',
        },
      },
      fontFamily: {
        sans: ['Nunito'],
        'nunito-bold': ['Nunito_700Bold'],
        'nunito-extrabold': ['Nunito_800ExtraBold'],
      },
      borderRadius: {
        xl: 20,
        '2xl': 24,
        '3xl': 32,
      },
    },
  },
  plugins: [],
}
