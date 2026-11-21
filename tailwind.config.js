/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F2A43',
        teal: { DEFAULT: '#0E8F7E', dark: '#0A6F62', soft: '#E3F4F1' },
        amber: { DEFAULT: '#F2B134', soft: '#FDF3DC' },
        mist: '#EEF3F6',
        line: '#D6DEE5',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,42,67,.05), 0 8px 24px -10px rgba(15,42,67,.14)',
        lift: '0 2px 4px rgba(15,42,67,.06), 0 22px 44px -14px rgba(15,42,67,.28)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'none' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
