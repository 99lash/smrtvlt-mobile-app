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
          DEFAULT: '#2563eb', // blue-600 (clear CTA, strong visibility)
          dark: '#1d4ed8', // blue-700 (pressed/hover)
          light: '#60a5fa', // blue-400 (hover/disabled subtle)
        },
        secondary: {
          DEFAULT: '#64748b', // slate-500 (supportive, not overpowering)
          dark: '#475569', // slate-600
          light: '#cbd5e1', // slate-300
        },
        text: {
          default: '#0f172a', // slate-900
          dark: '#EEEEEE',
        },
        bg:{
          default: '#f8fafc',
          dark: '#1b1c1b',
        },
        border:{
          default:'#e2e8f0',
          dark:'#595c58',
        },
        muted:{
          default: '#64748b',
          dark: '#393a38',
        },
        surface:{
          default: '#ffffff',
          active: '#eff1ed',
          dark: '#0F0E0E',
        },
        success: {
          DEFAULT: '#22c55e', // green-500
          dark: '#15803d', // green-700
          light: '#86efac', // green-300
        },
        warning: {
          DEFAULT: '#eab308', // amber-500
          dark: '#b45309', // amber-700
          light: '#fde68a', // amber-300
        },
        error: {
          DEFAULT: '#f87171', // red-500
          dark: '#b91c1c', // red-700
          light: '#fca5a5', // red-300
        },
        info: {
          DEFAULT: '#0ea5e9', // sky-500
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
      },
      borderRadius: {
        DEFAULT: '10px',
      },
    },
  },
  plugins: [],
};
