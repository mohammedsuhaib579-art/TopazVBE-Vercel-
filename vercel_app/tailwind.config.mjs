/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#667eea",
          600: "#5a67d8",
          700: "#4c51bf"
        },
        accent: {
          500: "#f093fb",
          600: "#f5576c"
        }
      }
    }
  },
  plugins: []
};


