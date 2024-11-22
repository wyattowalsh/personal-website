// tailwind.config.ts

import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './data/posts/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'border-muted': 'var(--border-muted)', // Add this line
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        display: ['var(--font-display)', ...fontFamily.sans],
        code: ['var(--font-code)', ...fontFamily.mono],
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        soft: 'var(--shadow-soft)',
        'header': 'var(--shadow-header)',
      },
      borderRadius: {
        xl: 'var(--radius)',
      },
      backgroundImage: {
        'gradient-background': 'var(--gradient-background)',
        'gradient-text': 'var(--gradient-text)',
        'gradient-heading': 'var(--gradient-heading)',
        'gradient-separator': 'var(--gradient-separator)',
        'header-overlay': 'var(--gradient-header-overlay)',
        'gradient-border': 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
      },
      animation: {
        fadeIn: 'fadeIn 1s forwards',
        float: 'float 4s ease-in-out infinite',
        glitch: 'glitch 2s ease-in-out infinite',
        gradient: 'gradientText 5s ease infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        rotateCube: "rotateCube 2s infinite linear",
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
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        glitch: {
          '0%': {
            textShadow: '0.05em 0 0 var(--glitch-color1), -0.05em -0.025em 0 var(--glitch-color2), -0.025em 0.05em 0 var(--glitch-color3)',
            filter: 'blur(0)',
          },
          '14%': {
            textShadow: '0.05em 0 0 var(--glitch-color2), -0.05em -0.025em 0 var(--glitch-color3), -0.025em 0.05em 0 var(--glitch-color1)',
            filter: 'blur(var(--glitch-blur))',
          },
          '28%': {
            textShadow: '0.05em 0 0 var(--glitch-color3), -0.05em -0.025em 0 var(--glitch-color1), -0.025em 0.05em 0 var(--glitch-color2)',
            filter: 'blur(0)',
          },
          '42%': {
            textShadow: '-0.05em 0 0 var(--glitch-color1), 0.025em 0.025em 0 var(--glitch-color2), -0.05em -0.05em 0 var(--glitch-color3)',
            filter: 'blur(var(--glitch-blur))',
          },
          '100%': {
            textShadow: '0.05em 0 0 var(--glitch-color1), -0.05em -0.025em 0 var(--glitch-color2), -0.025em 0.05em 0 var(--glitch-color3)',
            filter: 'blur(0)',
          },
        },
        glitchNoise: {
          '0%': {
            clipPath: 'inset(40% 0 61% 0)',
            transform: 'translate(-20px, -10px)',
          },
          '20%': {
            clipPath: 'inset(92% 0 1% 0)',
            transform: 'translate(20px, 10px)',
          },
          '40%': {
            clipPath: 'inset(43% 0 1% 0)',
            transform: 'translate(-20px, 10px) skewX(3deg)',
          },
          '60%': {
            clipPath: 'inset(25% 0 58% 0)',
            transform: 'translate(20px, -10px) skewX(-3deg)',
          },
          '80%': {
            clipPath: 'inset(54% 0 7% 0)',
            transform: 'translate(-20px, 10px)',
          },
          '100%': {
            clipPath: 'inset(58% 0 43% 0)',
            transform: 'translate(20px, -10px)',
          },
        },
        rotateCube: {
          "0%": {
            transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
          },
          "100%": {
            transform: "rotateX(360deg) rotateY(360deg) rotateZ(360deg)",
          },
        },
      },
      transitionDuration: {
        '700': '700ms',
      },
      transitionTimingFunction: {
        'header': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    typography,
    // Add custom utilities
    function({ addUtilities }: PluginAPI) {
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
