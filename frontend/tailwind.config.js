/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        surface: "#18181B",
        border: "#27272A",
        "cyber-purple": "#A855F7",
        "neon-crimson": "#EF4444",
        "emerald-green": "#10B981",
      },
    },
  },
  plugins: [],
};
