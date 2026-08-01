/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Asap"],
        asap: ["Asap"],
        "asap-medium": ["AsapMedium"],
        "asap-semibold": ["AsapSemiBold"],
        "asap-bold": ["AsapBold"],
        "asap-italic": ["AsapItalic"],
        "asap-medium-italic": ["AsapMediumItalic"],
        "asap-semibold-italic": ["AsapSemiBoldItalic"],
        "asap-bold-italic": ["AsapBoldItalic"],
      },
    },
  },
  plugins: [],
}
