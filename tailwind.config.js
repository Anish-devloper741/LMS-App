/** @type {import('tailwindcss').Config} */
module.exports = {
  // Yeh batata hai ki Tailwind kahan-kahan use hoga
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}