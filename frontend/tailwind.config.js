/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1B2C",
        canvas: "#F2F4F8",
        line: "#E1E6EE",
        muted: "#5B6778",
        primary: "#2547D0",
        "primary-dark": "#1B38A8",
        "primary-soft": "#E8EDFC",
        "ai-bg": "#EAF6F1",
        "ai-line": "#B5DFCF",
        "ai-text": "#0B6B4F",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "Inter", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
