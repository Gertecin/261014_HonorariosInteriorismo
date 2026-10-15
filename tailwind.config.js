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
        'bianchi-cemento': '#9A9A9A',
        'bianchi-cemento-light': '#E8E8E8',
        'bianchi-cemento-dark': '#4A4A4A',
        'bianchi-terracota': '#C4573F',
        'bianchi-terracota-light': '#D4755F',
      },
      fontFamily: {
        'futura': ['Futura', 'Helvetica', 'Arial', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'button': '0 4px 12px rgba(196, 87, 63, 0.3)',
      },
    },
  },
  plugins: [],
}
