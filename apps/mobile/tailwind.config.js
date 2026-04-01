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
          100: '#f0eeeb',
          200: '#e5e1dc',
          300: '#d1cbc4',
          400: '#b0a89e',
          500: '#8a8680',
          600: '#6b6660',
          700: '#524d48',
          800: '#3d3833',
          900: '#2a2520',
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
