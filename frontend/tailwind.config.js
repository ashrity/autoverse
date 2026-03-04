/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary accent — crimson red
        accent: {
          DEFAULT: '#e11d48',
          dim: '#9f1239',
          glow: 'rgba(225,29,72,0.25)',
        },
        // Surface palette
        surface: {
          base: '#050508',
          card: '#0f0f14',
          raised: '#18181f',
          border: '#27272f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(225,29,72,0.3)',
        'glow-sm': '0 0 10px rgba(225,29,72,0.2)',
      },
    },
  },
  plugins: [],
}
