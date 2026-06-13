/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          '50': 'rgb(var(--brand-50))',
          '100': 'rgb(var(--brand-100))',
          '200': 'rgb(var(--brand-200))',
          '300': 'rgb(var(--brand-300))',
          '400': 'rgb(var(--brand-400))',
          '500': 'rgb(var(--brand-500))',
          '600': 'rgb(var(--brand-600))',
          '700': 'rgb(var(--brand-700))',
          '800': 'rgb(var(--brand-800))',
          '900': 'rgb(var(--brand-900))',
          DEFAULT: 'rgb(var(--brand-500))',
        },
        'brand-content': 'rgb(var(--brand-content))',
        'brand-border': 'rgb(var(--brand-border))',
      }
    },
  },
  plugins: [],
}
