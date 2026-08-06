/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F17',
          card: '#131B2E',
          hover: '#1B2640',
          border: '#23314E'
        },
        brand: {
          primary: '#38BDF8',
          accent: '#818CF8',
          emerald: '#10B981',
          rose: '#F43F5E',
          purple: '#A855F7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
