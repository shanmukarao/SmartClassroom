/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0a3654',
        },
        inclusive: {
          teal: '#0d9488',
          amber: '#d97706',
          indigo: '#4f46e5',
          rose: '#e11d48',
          slate: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}
