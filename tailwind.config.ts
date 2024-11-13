// tailwind.config.ts

import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{md,mdx,js,jsx,ts,tsx}",
    "./components/**/*.{md,mdx,js,jsx,ts,tsx}",
    "./app/**/*.{md,mdx,js,jsx,ts,tsx}",
    "./posts/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6a9fb5",
        secondary: "#ff9a9e",
        accent: "#f4a261", // new color
      },
      fontFamily: {
        sans: ["Fira Code", ...fontFamily.sans],
        tech: ['Orbitron', 'sans-serif'],
        handwritten: ['Pacifico', 'cursive'],
        display: ['Oswald', ...fontFamily.sans], // new font family
      },
    },
  },
  plugins: [typography],
};

export default config;
