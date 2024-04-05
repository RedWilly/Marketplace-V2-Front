/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    screens: { lg: { max: "1500px" }, md: { max: "1250px" }, sm: { max: "782px" } },
    fontFamily: {
      'Kallisto': 'Kallisto',
    },
    colors: {
      'black': {
        50: '#8888a8',
        400: '#171732',
        500: '#2a2c30',
        600: '#1c1e20',
      },
      'grey': {
        10: '#FFFAFA',
        50: 'hsl(240deg 6% 60% / 20%)',
        100: '#9494a0'
      },
      "purple": '#a100b8',
      'white': '#fff',
      'blue': {
        100: '#8585ff',
        200: "#0401f6"
      },
      'transparent': 'transparent'
    },

    extend: {},
  },
  plugins: [],
}