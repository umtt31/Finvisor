/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app.{js,jsx,ts,tsx}",
    "./App.js", // App.js dosyasını ekledik
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'jost-regular': ['Jost-Regular'],
        'jost-medium': ['Jost-Medium'],
        'jost-semibold': ['Jost-SemiBold'],
        'jost-bold': ['Jost-Bold'],
      }
    },
  },
  plugins: [],
}
