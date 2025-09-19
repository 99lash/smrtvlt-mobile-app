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
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
        secondary: {
          DEFAULT: '#A1BFEF',
          dark: '#2563eb',
        },
        neutral: {
          bg: '#111827',
          surface: '#1f2937',
          border: '#374151',
          text: '#f9fafb',
          muted: '#9ca3af',
          DEFAULT: '#111827',
        },
        success: '#22c55e',
        warning: '#facc15',
        error: '#f87171',
        info: '#38bdf8',
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

      borderRadius: {
        DEFAULT: '10px',
      },
    },
  },
  plugins: [],
};
