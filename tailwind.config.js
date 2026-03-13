/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#2563EB',
          secondary: '#0F172A',
          bg: '#F8FAFC',
        }
      }
    },
  },
  plugins: [],
}
