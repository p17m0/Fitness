/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'orange-primary': '#FF6B35',
        'gray-dark': '#2C2C2C',
        'gray-light': '#F5F5F5',
      },
    },
  },
  plugins: [],
}

