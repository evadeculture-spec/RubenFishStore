/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: { DEFAULT: '#071B33', 900: '#071B33', 800: '#0B2A4A', 700: '#123A63', 600: '#1C4D80', 500: '#2F659C' },
        sand: { DEFAULT: '#FBF8F2', 50: '#FDFCF9', 100: '#FBF8F2', 200: '#F3EDE1', 300: '#E7DDCB', 400: '#CDBFA6' },
        tide: { DEFAULT: '#14857C', 50: '#E8F6F4', 100: '#C9ECE8', 200: '#93D9D1', 300: '#4FC0B4', 400: '#22A396', 500: '#14857C', 600: '#0F6C65', 700: '#0C5651' },
        coral: { DEFAULT: '#E0663E', 600: '#B94A25' },
        ink: { DEFAULT: '#14202E', soft: '#3F4D5C', muted: '#5E6B78' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Manrope Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: {
        card: '0 1px 2px rgba(7,27,51,0.06), 0 8px 24px -12px rgba(7,27,51,0.18)',
        lift: '0 2px 4px rgba(7,27,51,0.08), 0 18px 40px -16px rgba(7,27,51,0.30)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        'pop': { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'drift': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        'fade-up': 'fade-up 220ms ease-out both',
        'pop': 'pop 260ms cubic-bezier(.2,.9,.3,1.2) both',
        'drift': 'drift 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
