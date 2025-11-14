/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#175DD3',
          green: '#45D39D',
          cyan: '#5DD3D3',
        },
        'dark-blue': '#24406F',
        text: {
          deep: '#192A56',
        },
        bg: {
          white: '#FFFFFF',
          grey: '#EAEAEA',
          'blue-light': '#E8F4FF',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
