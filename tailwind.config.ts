import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./data/posts/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6a9fb5",
        secondary: "#ff9a9e",
        accent: "#f4a261",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        display: ["Oswald", ...fontFamily.sans],
        handwritten: ["Pacifico", "cursive"],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.800"),
            a: {
              color: theme("colors.blue.600"),
              "&:hover": {
                color: theme("colors.blue.500"),
              },
            },
            h1: {
              fontWeight: "700",
            },
            h2: {
              fontWeight: "700",
            },
            h3: {
              fontWeight: "600",
            },
            code: {
              color: theme("colors.pink.600"),
              backgroundColor: theme("colors.gray.100"),
              padding: "2px 4px",
              borderRadius: "4px",
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              borderRadius: "0",
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.200"),
            a: {
              color: theme("colors.blue.400"),
              "&:hover": {
                color: theme("colors.blue.300"),
              },
            },
            code: {
              color: theme("colors.pink.400"),
              backgroundColor: theme("colors.gray.800"),
            },
            "pre code": {
              backgroundColor: "transparent",
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;
