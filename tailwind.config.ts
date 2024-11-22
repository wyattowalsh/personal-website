import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';
import { ThemeConfig } from 'tailwindcss/types/config';
import { PluginAPI } from 'tailwindcss/types/config';

// Update the function definition to match Tailwind's expected types
function withOpacityValue(variable: string) {
  return ({ opacityValue }: { opacityValue: number | undefined }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

const config: Config = {
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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb))',
          foreground: 'var(--primary-foreground)',
          20: 'rgb(var(--primary-rgb) / 0.2)',
          30: 'rgb(var(--primary-rgb) / 0.3)',
        },
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
        'border-muted': 'var(--border-muted)',
        'math-bg': 'rgb(var(--math-bg) / <alpha-value>)',
        'math-bg-transparent': 'rgb(var(--math-bg-transparent) / <alpha-value>)',
        'math-border': 'var(--math-border)',
        'math-controls-bg': 'var(--math-controls-bg)',
        'math-controls-hover': 'var(--math-controls-hover)',
        'math-controls-text': 'rgb(var(--math-controls-text) / <alpha-value>)',
        'math-controls-text-hover': 'rgb(var(--math-controls-text-hover) / <alpha-value>)',
        'math-inline': `rgb(var(--math-bg-transparent) / <alpha-value>)`,
        'math-text-color': 'var(--math-text-color)',
        'math-index-color': 'var(--math-index-color)',
        'math-inline-bg': 'var(--math-inline-bg)',
        'math-display-bg': 'var(--math-display-bg)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-code)', 'monospace'],
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        soft: 'var(--shadow-soft)',
        'header': 'var(--shadow-header)',
        'math': 'var(--math-shadow)',
        'math-hover': 'var(--math-hover-shadow)',
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
      },
      animation: {
        fadeIn: 'fadeIn 1s forwards',
        float: 'float 4s ease-in-out infinite',
        glitch: 'glitch 2s ease-in-out infinite',
        gradient: 'gradientText 5s ease infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        rotateCube: "rotateCube 2s infinite linear",
        'code-blink': 'code-blink 1s ease-in-out infinite',
        'glitch-text': 'glitch 2.5s infinite',
        'glitch-skew': 'glitch-skew 2s infinite',
        'glitch-clip': 'glitch-clip 3s infinite linear alternate-reverse',
        'card-hover': 'card-hover 0.3s ease-in-out forwards',
        'card-float': 'card-float 3s ease-in-out infinite',
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
        },
        'code-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'glitch': {
          '0%': { 
            textShadow: 'var(--glitch-shadow-1)'
          },
          '2%': { 
            textShadow: 'var(--glitch-shadow-2)'
          },
          '4%': {
            textShadow: 'var(--glitch-shadow-3)'
          },
          '6%': {
            textShadow: 'var(--glitch-shadow-1)'
          },
          '8%': {
            textShadow: 'var(--glitch-shadow-2)'
          },
          '10%, 100%': {
            textShadow: 'none'
          }
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
    },
  },
  plugins: [
    typography,
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
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;