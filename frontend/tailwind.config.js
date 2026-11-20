export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0A1628',
        muted: '#5B6B82',
        line: '#E8EBF0',
        accent: '#FF5A1F',
        soft: '#FFF1E8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      }
    },
  },
  plugins: [],
}