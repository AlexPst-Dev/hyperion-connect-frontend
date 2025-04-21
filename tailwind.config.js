/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        deepBlue: "#1E3A8A",
        lightBlue: "#2563EB",
        orange: "#F97316",
        lightOrange: "#FF9F45",
        gold: "#CAAB4F",
        grey: "#374151",
      },
    },
  },
  plugins: [],
};
