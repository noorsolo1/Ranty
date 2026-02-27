/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse-slow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ping-slower': 'ping-slower 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'ping-slow': {
          '75%, 100%': { transform: 'scale(1.2)', opacity: '0' },
        },
        'ping-slower': {
          '75%, 100%': { transform: 'scale(1.4)', opacity: '0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
