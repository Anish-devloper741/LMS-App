/** @type {import('tailwindcss').Config} */
module.exports = {
  // Yahan hum tailwind ko bata rahe hain ki styling kahan apply karni hai
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}