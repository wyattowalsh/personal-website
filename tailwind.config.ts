import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';
import { ThemeConfig } from 'tailwindcss/types/config';
import { PluginAPI } from 'tailwindcss/types/config';

// Helper function to create color values with opacity
// Remove or modify the withOpacityValue function as we'll use the new syntax
// const theme section update
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}

const config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{html,js,jsx,ts,tsx,md,mdx,css,scss}',
    './components/**/*.{html,js,jsx,ts,tsx,md,mdx,css,scss}',
    './app/globals.scss',
    './app/variables.module.scss',
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: `rgb(var(--background) / <alpha-value>)`,
        foreground: `rgb(var(--foreground) / <alpha-value>)`,
        primary: {
          DEFAULT: `rgb(var(--primary) / <alpha-value>)`,
          light: `rgb(var(--primary-light) / <alpha-value>)`,
          foreground: `rgb(var(--primary-foreground) / <alpha-value>)`,
          20: 'rgb(var(--primary-rgb) / 0.2)',
          30: 'rgb(var(--primary-rgb) / 0.3)',
        },
        'primary-foreground': `rgb(var(--primary-foreground) / <alpha-value>)`,
        secondary: {
          DEFAULT: `rgb(var(--secondary) / <alpha-value>)`,
          foreground: `rgb(var(--secondary-foreground) / <alpha-value>)`,
        },
        'secondary-foreground': `rgb(var(--secondary-foreground) / <alpha-value>)`,
        accent: {
          DEFAULT: `rgb(var(--accent) / <alpha-value>)`,
          foreground: `rgb(var(--accent-foreground) / <alpha-value>)`,
          '10': 'rgb(var(--accent-rgb) / 0.1)',
          '20': 'rgb(var(--accent-rgb) / 0.2)',
          '30': 'rgb(var(--accent-rgb) / 0.3)',
          '40': 'rgb(var(--accent-rgb) / 0.4)',
          '50': 'rgb(var(--accent-rgb) / 0.5)',
        },
        'accent-foreground': `rgb(var(--accent-foreground) / <alpha-value>)`,
        destructive: `rgb(var(--destructive) / <alpha-value>)`,
        'destructive-foreground': `rgb(var(--destructive-foreground) / <alpha-value>)`,
        muted: {
          DEFAULT: `rgb(var(--muted) / <alpha-value>)`,
          foreground: `rgb(var(--muted-foreground) / <alpha-value>)`,
        },
        'muted-foreground': `rgb(var(--muted-foreground) / <alpha-value>)`,
        card: `rgb(var(--card) / <alpha-value>)`,
        'card-foreground': `rgb(var(--card-foreground) / <alpha-value>)`,
        popover: `rgb(var(--popover) / <alpha-value>)`,
        'popover-foreground': `rgb(var(--popover-foreground) / <alpha-value>)`,
        border: `rgb(var(--border) / <alpha-value>)`,
        input: `rgb(var(--input) / <alpha-value>)`,
        ring: `rgb(var(--ring) / <alpha-value>)`,
        'border-muted': 'var(--border-muted)',
        'math-bg': 'rgb(var(--math-bg) / <alpha-value>)',
        'math-bg-transparent': 'rgb(var(--math-bg-transparent) / <alpha-value>)',
        'math-border': 'rgb(var(--math-border) / <alpha-value>)',
        'math-controls-bg': 'var(--math-controls-bg)',
        'math-controls-hover': 'var(--math-controls-hover)',
        'math-controls-text': 'rgb(var(--math-controls-text) / <alpha-value>)',
        'math-controls-text-hover': 'rgb(var(--math-controls-text-hover) / <alpha-value>)',
        'math-inline': `rgb(var(--math-bg-transparent) / <alpha-value>)`,
        'math-text-color': 'var(--math-text-color)',
        'math-index-color': 'var(--math-index-color)',
        'math-inline-bg': 'var(--math-inline-bg)',
        'math-display-bg': 'var(--math-display-bg)',
        'math-display-number': 'var(--math-display-number)',
        'math-display-number-hover': 'var(--math-display-number-hover)',
        'post-header': {
          'gradient-from': 'var(--post-header-gradient-from)',
          'gradient-via': 'var(--post-header-gradient-via)',
          'gradient-to': 'var(--post-header-gradient-to)',
          'border': 'var(--post-header-border)',
        },
        'back-link': {
          'bg': 'var(--back-link-bg)',
          'hover-bg': 'var(--back-link-hover-bg)',
          'border': 'var(--back-link-border)',
        },
        // Add selection colors
        'selection-bg': 'var(--selection-bg)',
        'selection-text': 'var(--selection-text)',
        'selection-heading-bg': 'var(--selection-heading-bg)',
        'selection-heading-text': 'var(--selection-heading-text)',
        'math-scrollbar': {
          DEFAULT: 'rgb(var(--math-controls-text) / 0.2)',
          hover: 'rgb(var(--math-controls-text) / 0.3)',
        },
        caption: {
          bg: 'var(--caption-bg)',
          'hover-bg': 'var(--caption-hover-bg)',
          fg: 'var(--caption-fg)',
          'hover-fg': 'var(--caption-hover-fg)',
          border: 'var(--caption-border)',
          'hover-border': 'var(--caption-hover-border)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-card-hover': 'var(--bg-card-hover)',
        'tag': {
          DEFAULT: 'var(--tag-text)',
          hover: 'var(--tag-text-hover)',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        soft: 'var(--shadow-soft)',
        'header': 'var(--shadow-header)',
        'math': 'var(--math-shadow)',
        'math-hover': 'var(--math-hover-shadow)',
        'post-header': 'var(--post-header-shadow)',
        'post-header-hover': 'var(--post-header-hover-shadow)',
        'back-link': 'var(--back-link-shadow)',
        'back-link-hover': 'var(--back-link-hover-shadow)',
        neon: "0 0 10px var(--neon-color)",
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
        'pagination-gradient': 'linear-gradient(135deg, var(--card-gradient-from), var(--card-gradient-to))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        fadeIn: 'fadeIn 1s forwards',
        float: 'float 4s ease-in-out infinite',
        glitch: 'glitch 2s ease-in-out infinite',
        gradient: 'gradient 8s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        rotateCube: "rotateCube 2s infinite linear",
        'code-blink': 'code-blink 1s ease-in-out infinite',
        'glitch-text': 'glitch 2.5s infinite',
        'glitch-skew': 'glitch-skew 2s infinite',
        'glitch-clip': 'glitch-clip 3s infinite linear alternate-reverse',
        'card-hover': 'card-hover 0.3s ease-in-out forwards',
        'card-float': 'card-float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'title-glow': 'titleGlow 2s ease-in-out infinite alternate',
        'float-smooth': 'float-smooth 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'subtitle-fade': 'subtitleFade 0.5s ease-out forwards',
        'subtitle-slide': 'subtitleSlide 0.5s ease-out forwards',
        'spin-slow': 'spin 10s linear infinite',
        'pulse-fast': 'pulse 1s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        floating: 'floating 6s ease-in-out infinite', // Add this line
        cursor: "cursorAnimation 0.5s infinite alternate",
        'float-orb': 'floatOrb 20s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'ripple': 'ripple 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-delayed': 'float 6s ease-in-out infinite 0.5s',
        'glitch-flash': 'glitch-flash 3.5s ease infinite',
        'morph-gradient': 'morph-gradient 10s ease infinite',
        'spinner-rotate': 'rotateCube 2s infinite linear',
        'spinner-glitch': 'glitch 750ms infinite',
        'spinner-shift': 'glitch-shift 4s infinite linear alternate',
        'title-float': 'titleFloat 6s ease-in-out infinite',
        'title-shimmer': 'titleShimmer 3s ease-in-out infinite',
        gradientAnimation: 'gradientAnimation 8s ease infinite',
        'text-gradient': 'textGradient 5s ease infinite',
        'tag-float': 'tag-float 3s ease-in-out infinite',
        'tag-glow': 'tag-glow 2s ease-in-out infinite',
        'tag-shimmer': 'tag-shimmer 3s linear infinite',
        'tag-pulse': 'tag-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'tag-shine': 'tag-shine 1.5s ease-in-out infinite',
        'tag-bounce': 'tag-bounce 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          to: { opacity: '1' },
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
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
          'from': { transform: 'rotateX(0) rotateY(0) rotateZ(0)' },
          'to': { transform: 'rotateX(360deg) rotateY(360deg) rotateZ(360deg)' },
        },
        'code-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'glitch': {
          '0%': { 
            textShadow: 'var(--glitch-shadow-1)',
            transform: 'translate(0)'
          },
          '2%': { 
            textShadow: 'var(--glitch-shadow-2)',
          },
          '4%': {
            textShadow: 'var(--glitch-shadow-3)',
          },
          '6%': {
            textShadow: 'var(--glitch-shadow-1)',
          },
          '8%': { 
            textShadow: 'var(--glitch-shadow-2)',
          },
          '10%': {
            textShadow: 'none'
          },
          '20%': { 
            transform: 'translate(-2px, 2px)' 
          },
          '40%': { 
            transform: 'translate(-2px, -2px)' 
          },
          '60%': { 
            transform: 'translate(2px, 2px)' 
          },
          '80%': { 
            transform: 'translate(2px, -2px)' 
          },
          '100%': { 
            textShadow: 'none',
            transform: 'translate(0)' 
          },
        },
        'glitch-skew': {
          '0%': { transform: 'skew(0deg)' },
          '2%': { transform: 'skew(3deg)' },
          '4%': { transform: 'skew(-3deg)' },
          '6%': { transform: 'skew(2deg)' },
          '8%': { transform: 'skew(-1deg)' },
          '10%, 100%': { transform: 'skew(0deg)' }
        },
        'card-hover': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        'card-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'title-glow': {
          'from': { textShadow: '0 0 20px var(--primary)' },
          'to': { textShadow: '0 0 30px var(--primary), 0 0 10px var(--primary)' }
        },
        'float-smooth': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        subtitleFade: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtitleSlide: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: "0", transform: 'translateY(20px)' },
          '100%': { opacity: "1", transform: 'translateY(0)' },
        },
        floating: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        cursorAnimation: {
          "0%": { transform: "translate(-50%, -50%) scale(1)" },
          "100%": { transform: "translate(-50%, -50%) scale(1.5)" },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, -30px) scale(1.1)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '0.8' }
        },
        gradientShift: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'glitch-flash': {
          '0%, 100%': { opacity: '1' },
          '33%': { opacity: '0.8' },
          '66%': { opacity: '0.9' },
        },
        'morph-gradient': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'glitch-shift': {
          '0%': { transform: 'translateX(-2px)' },
          '100%': { transform: 'translateX(2px)' },
        },
        titleFloat: {
          '0%, 100%': { transform: 'translateY(0) rotateX(0)' },
          '50%': { transform: 'translateY(-10px) rotateX(5deg)' },
        },
        titleGlow: {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 10px rgba(var(--primary-rgb), 0.3))' },
          '50%': { filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(var(--primary-rgb), 0.5))' },
        },
        titleShimmer: {
          '0%': { backgroundPosition: '200% 50%' },
          '100%': { backgroundPosition: '-200% 50%' },
        },
        gradientAnimation: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        textGradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'tag-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'tag-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(var(--primary-rgb), 0.3), 0 0 10px rgba(var(--primary-rgb), 0.2)'
          },
          '50%': { 
            boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.5), 0 0 20px rgba(var(--primary-rgb), 0.3)'
          }
        },
        'tag-shimmer': {
          '0%': { backgroundPosition: '200% 50%' },
          '100%': { backgroundPosition: '-200% 50%' }
        },
        'tag-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'tag-shine': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'tag-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        '700': '700ms',
      },
      transitionTimingFunction: {
        'header': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            // Update to remove default spacing
            '> :first-child': {
              marginTop: '0 !important',
              paddingTop: '0 !important',
            },
            color: 'var(--foreground)',
            maxWidth: '90ch',
            h1: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h2: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h3: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h4: {
              color: 'var(--foreground)', 
              fontFamily: 'var(--font-display)',
            },
            h5: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h6: {
              color: 'var(--foreground)', 
              fontFamily: 'var(--font-display)',
            },
            a: {
              color: 'var(--primary)',
              '&:hover': {
                color: 'var(--primary-foreground)',
              },
            },
            blockquote: {
              borderLeftColor: 'var(--border)',
              color: 'var(--muted-foreground)',
            },
            code: {
              color: 'var(--foreground)',
              backgroundColor: 'var(--muted)',
              borderRadius: '0.25rem',
              padding: '0.2em 0.4em',
              fontWeight: '500',
              fontFamily: 'var(--font-code)',
              fontSize: '0.9em',
              letterSpacing: '-0.025em',
              '&::before': {
                content: '""',
                display: 'none',
              },
              '&::after': {
                content: '""',
                display: 'none',
              }
            },
            hr: {
              borderColor: 'var(--border)',
            },
            strong: {
              color: 'var(--foreground)',
            },
            thead: {
              borderBottomColor: 'var(--border)',
              th: {
                color: 'var(--foreground)',
              }
            },
            tbody: {
              tr: {
                borderBottomColor: 'var(--border)',
              }
            },
            '@screen lg': {
              maxWidth: '100ch',
            },
            '@screen xl': {
              maxWidth: '110ch',
            },
            '@screen 2xl': {
              maxWidth: '120ch',
            },
            'h1,h2,h3,h4,h5,h6': {
              scrollMarginTop: theme('spacing.32'),
            },
            '.math-inline': {
              backgroundColor: 'var(--math-bg-transparent)',
              borderRadius: theme('borderRadius.md'),
              padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            '.katex-display': {
              overflow: 'auto hidden',
              width: '100%',
              textAlign: 'center',
              padding: `${theme('spacing.4')} 0`,
            },
          }
        },
        dark: {
          css: {
            color: theme('colors.foreground'),
            '[class~="lead"]': {
              color: theme('colors.foreground'),
            },
            a: {
              color: theme('colors.primary'),
            },
            strong: {
              color: theme('colors.foreground'),
            },
            'ol > li::before': {
              color: theme('colors.foreground'),
            },
            'ul > li::before': {
              backgroundColor: theme('colors.foreground'),
            },
            hr: {
              borderColor: theme('colors.border'),
            },
            blockquote: {
              color: theme('colors.foreground'),
              borderLeftColor: theme('colors.border'),
            },
            h1: {
              color: theme('colors.foreground'),
            },
            h2: {
              color: theme('colors.foreground'),
            },
            h3: {
              color: theme('colors.foreground'),
            },
            h4: {
              color: theme('colors.foreground'),
            },
            'figure figcaption': {
              color: theme('colors.foreground'),
            },
            code: {
              color: theme('colors.foreground'),
            },
            'a code': {
              color: theme('colors.foreground'),
            },
            pre: {
              color: theme('colors.foreground'),
              backgroundColor: theme('colors.background'),
            },
            thead: {
              color: theme('colors.foreground'),
              borderBottomColor: theme('colors.border'),
            },
            'tbody tr': {
              borderBottomColor: theme('colors.border'),
            },
          },
        },
        lg: {
          css: {
            maxWidth: '100ch',
          },
        },
        xl: {
          css: {
            maxWidth: '110ch',
          },
        },
        '2xl': {
          css: {
            maxWidth: '120ch',
          },
        },
      }),
      opacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      backgroundOpacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      borderOpacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      backgroundColor: {
        'scrollbar-track': 'transparent',
      },
      textShadow: {
        'glow': '0 0 10px var(--primary), 0 0 20px var(--primary)',
        'glow-dark': '0 0 10px var(--primary-foreground), 0 0 20px var(--primary-foreground)',
      },
      transform: {
        '3d': 'perspective(600px) rotateY(10deg)',
      },
      dropShadow: {
        'sm': '0 1px 1px rgba(0,0,0,0.05)',
      },
    },
  },
  future: {
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: false,
  },
  variants: {
    extend: {
      transform: ['hover', 'responsive'],
      animation: ['hover', 'focus'],
    },
  },
  plugins: [
    typography,
    addVariablesForColors,
    function({ addUtilities }: PluginAPI) {
      const newUtilities = {
        '.bg-gradient-text': {
          background: 'var(--gradient-text)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-size': '200% 200%',
        },
        '.shadow-soft': {
          boxShadow: 'var(--shadow-soft)',
        },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
        },
        '.scrollbar-track-transparent': {
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        },
        '.scrollbar-thumb-rounded': {
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
          },
        },
        '.text-shadow-glow': {
          textShadow: '0 0 10px var(--primary), 0 0 20px var(--primary)',
        },
        '.text-shadow-glow-dark': {
          textShadow: '0 0 10px var(--primary-foreground), 0 0 20px var(--primary-foreground)',
        },
        '.scrollbar-math': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--math-controls-text)',
            opacity: '0.2',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            opacity: '0.3',
          },
        },
        // Add custom scrollbar utilities
        '.scrollbar-thumb-math': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgb(var(--math-controls-text) / 0.2)',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgb(var(--math-controls-text) / 0.3)',
          },
        },
      };
      addUtilities(newUtilities, {
        respectPrefix: true,
        respectImportant: true
      });
    },
    function({ addComponents, theme }: PluginAPI) {
      addComponents({
        '.bg-gradient-glow': {
          backgroundImage: `linear-gradient(to right, ${theme('colors.primary.DEFAULT')}, ${theme('colors.accent.DEFAULT')})`,
          opacity: '0.2',
        },
      });
    },
  ],
} satisfies Config;

export default config;