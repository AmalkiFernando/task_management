/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#151616',
        paper: '#101112',
        slate: {
          850: 'rgb(185, 197, 237)',
        },
      accent: {
        DEFAULT: '#6292fa',
        soft: '#111827',
      },
      signal: {
        done: '#1F9D6C',
        progress: '#2563EB',
        blocked: '#7C3AED',
      },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
