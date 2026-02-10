/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#2e2a27',
        secondary: '#6f6a65',
        divider: '#ebe7e2',
        bg: '#faf9f6',
      },
      borderRadius: {
        'lg': '0.5rem',
      },
    },
  },
  plugins: [],
};
