/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ipl: {
          blue: "#004BA0",
          yellow: "#F9CD05",
          red: "#EC1C24",
          purple: "#3A225D",
          orange: "#F26522",
          pink: "#EA1A85",
          navy: "#0E1A2B",
          dark: "#080E18",
          card: "#131F33",
          border: "#1E304F",
          accent: "#00F0FF",
        },
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gavel': 'gavelHit 0.6s ease-in-out',
      },
      keyframes: {
        gavelHit: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '30%': { transform: 'rotate(-30deg)' },
          '60%': { transform: 'rotate(20deg)' },
        },
      },
    },
  },
  plugins: [],
};
