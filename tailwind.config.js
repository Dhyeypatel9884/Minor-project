/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1ab2a6', // Teal from image
          dark: '#148e85',
        },
        secondary: {
          DEFAULT: '#f97316', // Orange from image
        },
        sage: '#f0fdfa', // Light teal background
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
