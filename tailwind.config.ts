import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f7f6f3",
          100: "#ece8e0",
          200: "#d9d1c4",
          300: "#b8ab98",
          400: "#958674",
          500: "#766b5c",
          600: "#5d554a",
          700: "#4c463d",
          800: "#423c35",
          900: "#292520",
          950: "#1a1815",
        },
        ember: {
          500: "#c45c3e",
          600: "#b24a32",
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
