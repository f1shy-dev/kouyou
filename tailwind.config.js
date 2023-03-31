/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "material": {
          "card": "rgb(48,56,70)",
        },
        "base-white": "rgb(250,245,255)"
      },
    },
    plugins: [],
  }
}
