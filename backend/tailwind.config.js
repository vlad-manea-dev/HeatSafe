/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Landing page (teammate)
        primary: '#af101a',
        surface: '#fbf9f4',
        ink: '#1b1c19',
        // Dashboard / map pages
        border: '#EAE6E1',
        muted: '#8A8683',
        text: '#2C2A29',
        bg: '#FDFBF7',
        'background-light': '#FDFBF7',
        'risk-amber': '#E76F51',
        'safe-sage': '#4A7C59',
        'enterprise-blue': '#2563EB',
      },
      fontFamily: {
        newsreader: ['Newsreader', 'Georgia', 'serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['Fraunces', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(44, 42, 41, 0.04)',
        floating: '0 4px 24px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
