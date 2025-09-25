// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vereador-blue': '#0057b8',
        'vereador-blue-dark': '#004494',
        'vereador-bg': '#f5f6f7',
      },
      boxShadow: {
        'vereador-card': '0 10px 30px rgba(11, 44, 88, 0.12)',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
    },
  },
  plugins: [],
}