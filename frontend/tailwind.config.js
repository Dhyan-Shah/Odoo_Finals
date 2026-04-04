/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff8f1',
          100: '#ffecd8',
          200: '#ffd4aa',
          300: '#ffb571',
          400: '#ff8c35',
          500: '#f96a0a',
          600: '#ea5200',
          700: '#c23d02',
          800: '#9a320a',
          900: '#7c2c0b',
        },
        surface: {
          50:  '#fafaf9',
          100: '#f5f5f3',
          200: '#e8e8e4',
          300: '#d4d4ce',
          400: '#b8b8b2',
          500: '#8a8a84',
          600: '#666660',
          700: '#444440',
          800: '#2a2a27',
          900: '#1a1a17',
          950: '#0f0f0d',
      }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateY(8px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        bounceIn: { from: { transform: 'scale(0.85)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        pulseRing: { '0%': { transform: 'scale(1)', opacity: 1 }, '100%': { transform: 'scale(1.6)', opacity: 0 } },
      },
    },
  },
  plugins: [],
}
