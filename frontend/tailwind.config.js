/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 15s linear infinite", // Marquee animation
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      colors: {
        "app-bg": "#3f3f3f",
        // appBg: "#3f3f33",
      },
      backgroundImage: {
        "gradient-yellow-headers":
          "linear-gradient(to right, #d97706, #facc15)",
        "gradient-yellow-cards": "linear-gradient(to right, #DAA521, #FFDF00)",
      },
    },
  },
  plugins: [],
};
