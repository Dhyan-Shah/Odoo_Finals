/** @type {import('tailwindcss').Config} */
<<<<<<< HEAD
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f59e0b", // main cafe golden color
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
=======
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
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
      },
    },
  },
  plugins: [],
<<<<<<< HEAD
};
=======
}
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
