/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bianchi-white': '#FFFFFF',
        'bianchi-cemento-light': '#E5E7EB',
        'bianchi-cemento': '#8A8D91',
        'bianchi-cemento-dark': '#4B5563',
        'bianchi-terracota': '#C85A46',
        'bianchi-terracota-light': '#E2725B',
      },
      fontFamily: {
        'futura': ['Futura', 'Trebuchet MS', 'Arial', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'button': '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
