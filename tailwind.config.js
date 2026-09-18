/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040914',
          900: '#070F1E',
          850: '#0B172E',
          800: '#102242',
          750: '#162C55',
          700: '#1C386C',
          600: '#254A8E',
        },
        cogni: {
          blue: '#0080FF',
          darkBlue: '#0062C4',
          lightBlue: '#38BDF8',
          cyan: '#06B6D4',
          teal: '#14B8A6',
          green: '#10B981',
          gold: '#F59E0B',
          coral: '#F43F5E',
          surface: '#0F1E38',
          surfaceCard: '#132444',
          surfaceHover: '#1B315B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(0, 128, 255, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
