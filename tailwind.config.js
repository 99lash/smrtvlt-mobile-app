/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      // TEMPORARY: for the meantime let's use this color pallete across the  entire codebase
      colors: {
        primary: {
          default: '#1055C9', 
        },
        secondary: {
          default: '#1a0f3e'
        },
        text: {
          default: '#EEEEEE', 
          dark: '#2A3335'
        },
        icons:{
          default: '#D4EBF8',
          dark: '#D4EBF8',
          light: '#80C4E9'
        },
        bg:{
          default: '#F2F0EF'
        },
        cards:{
          default: '#1055C9',
          dark: '#8c8c84'
        },
        border:{
          default:'#e2e8f0',
          dark:'#989ea6',
        }, 
        muted:{
          default: '#393a38',
          dark: '#393a38',
        },
        surface:{
          default: '#fafafa',
          active: '#eff1ed',
          dark: '#0F0E0E',
        },
        success: {
          default: '#22c55e', // green-500
          dark: '#15803d', // green-700
          light: '#86efac', // green-300
        },
        warning: {
          default: '#eab308', // amber-500
          dark: '#b45309', // amber-700
          light: '#fde68a', // amber-300
        },
        error: {
          default: '#f87171', // red-500
          dark: '#b91c1c', // red-700
          light: '#fca5a5', // red-300
        },
        info: {
          default: '#0ea5e9', // sky-500
          dark: '#0369a1', // sky-700
          light: '#7dd3fc', // sky-300
        },
      },

      // sizes:
      // text-base → body text
      // text-lg → subheadings
      // text-xl → headings
      // text-2xl/3xl → titles
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
      // font families
      fontFamily: {
        sans: ['Inter'],
        heading: ['Poppins'],
        'bbh-bartle': ['BBH Sans Bartle', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
      },
    },
  },
  plugins: [],
};
