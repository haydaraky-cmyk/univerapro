/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          500: '#3b5bdb',
          600: '#2f4ac9',
          700: '#2340b0',
          900: '#0d1f6b',
        },
        gold: {
          400: '#f5c842',
          500: '#e8b520',
          600: '#c99a10',
        },
        dark: {
          900: '#080c1a',
          800: '#0f1629',
          700: '#161e38',
          600: '#1e2845',
        }
      },
      fontFamily: {
        arabic: ['Noto Kufi Arabic', 'Cairo', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        glow: { '0%': { boxShadow: '0 0 20px rgba(59,91,219,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(59,91,219,0.7)' } },
      }
    },
  },
  plugins: [],
}
