/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f8fafc',
          100: '#eef2f6',
          200: '#d9e2ec',
          500: '#64748b',
          700: '#263244',
          900: '#07111f',
        },
        brand: {
          400: '#7dd3fc',
          500: '#38bdf8',
          600: '#0284c7',
        },
        aurora: {
          400: '#34d399',
          500: '#10b981',
        },
      },
      boxShadow: {
        premium: '0 24px 80px -36px rgba(8, 18, 35, 0.45)',
        glow: '0 24px 70px -38px rgba(56, 189, 248, 0.7)',
      },
      animation: {
        'fade-up': 'fadeUp 0.65s cubic-bezier(.2,.8,.2,1) both',
        shimmer: 'shimmer 2.2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(18px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
