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
        // Base colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // UI colors
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        display: ["var(--font-display)", ...fontFamily.sans],
        code: ["var(--font-code)", ...fontFamily.mono],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        soft: "var(--shadow-soft)",
      },
      backgroundImage: {
        'gradient-primary': "var(--gradient-background)",
        'gradient-text': "var(--gradient-text)",
        'gradient-separator': "var(--gradient-separator)",
      },
      animation: {
        'fadeIn': 'fadeIn 1s forwards',
        'float': 'float 4s ease-in-out infinite',
        'glitch': 'glitch 2s ease-in-out infinite',
        'gradient': 'gradientText 5s ease infinite',
      },
      keyframes: {
        fadeIn: {
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gradientText: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary-foreground))',
              },
            },
            code: {
              color: 'hsl(var(--accent))',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: 'var(--radius)',
              padding: '0.2em 0.4em',
            },
          },
        },
      }),
    },
  },
  plugins: [
    typography,
    // Add custom utilities
    function({ addUtilities }) {
      addUtilities({
        '.bg-gradient-text': {
          background: 'var(--gradient-text)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-size': '200% 200%',
        },
      });
    },
  ],
};

export default config;
