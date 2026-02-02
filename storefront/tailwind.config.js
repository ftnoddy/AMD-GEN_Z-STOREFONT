/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'system-ui', 'sans-serif'],
      },
      colors: {
        store: {
          primary: '#f1f5f9',
          accent: '#06b6d4',
          muted: '#94a3b8',
        },
        'neon-cyan': '#00d9ff',
        'neon-purple': '#a855f7',
        'dark-bg': '#0f172a',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 217, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
      },
    },
  },
  plugins: [],
};
