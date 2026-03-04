/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          default: '#FFFFFF', // Pure White
        },
        secondary: {
          default: '#333333' // Dark Gray
        },
        text: {
          default: '#FFFFFF', 
          light: '#FFFFFF',
          dark: '#000000'
        },
        icons:{
          default: '#FFFFFF',
          dark: '#000000',
          light: '#A1A1AA'
        },
        bg:{
          default: '#000000' // Absolute Black
        },
        cards:{
          default: '#18181B', // Zinc-900
          dark: '#09090B'
        },
        border:{
          default:'#27272A', // Zinc-800
          dark:'#52525B',
        }, 
        muted:{
          default: '#71717A', // Zinc-400
          dark: '#71717A',
        },
        accent: {
          default: '#22D3EE', // cyan-400
          dim: '#0891B2',     // cyan-600
        },
        status: {
          success: '#22C55E', // green-500
          warning: '#F59E0B', // amber-500
          danger: '#EF4444',  // red-500
          neutral: '#71717A', // zinc-500
        },
        surface:{
          default: '#18181B',
          active: '#27272A',
          dark: '#000000',
        },
        success: {
          default: '#FFFFFF',
          dark: '#A1A1AA',
          light: '#F4F4F5',
        },
        warning: {
          default: '#A1A1AA',
          dark: '#52525B',
          light: '#E4E4E7',
        },
        error: {
          default: '#FFFFFF',
          dark: '#71717A',
          light: '#F4F4F5',
        },
        info: {
          default: '#FFFFFF',
          dark: '#A1A1AA',
          light: '#F4F4F5',
        },
      },
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
