/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Electric brand cyan (design-system.css)
        cyan: {
          50: '#f0fdff', 100: '#ccf9ff', 200: '#99f2ff', 300: '#66ecff',
          400: '#33e5ff', 500: '#0bf9ff', 600: '#00d9e6', 700: '#00b3bf',
          800: '#008c99', 900: '#006673', 950: '#003d4d',
        },
        // Electric brand lime (design-system.css)
        lime: {
          50: '#fdffe6', 100: '#f8ffb3', 200: '#f3ff80', 300: '#eeff4d',
          400: '#e9ff33', 500: '#d3ff1a', 600: '#b8e600', 700: '#9cbf00',
          800: '#809900', 900: '#657300', 950: '#4a4d00',
        },
        // Warm neutrals (design-system.css) for a premium, non-generic dark
        neutral: {
          50: '#fafaf9', 100: '#f5f4ec', 200: '#e7e5d3', 300: '#d3d1bd',
          400: '#a8a694', 500: '#8b8977', 600: '#6f6d5c', 700: '#57554a',
          800: '#3d3b33', 900: '#262626', 950: '#1a1a1a',
        },
        // Natural light theme: sand page canvas, cream surfaces/cards
        // (design-system.css --bg-primary / --bg-elevated)
        sand: '#d4c5a0',
        cream: '#fbf8f0',
        // Palette-reactive semantic tokens — resolve to CSS custom properties
        // written at runtime by applyTheme() in src/lib/themes.ts.
        bg: 'var(--bg-primary)',
        surface: 'var(--bg-secondary)',
        elevated: 'var(--bg-elevated)',
        fg: 'var(--text-primary)',
        'fg-secondary': 'var(--text-secondary)',
        'fg-tertiary': 'var(--text-tertiary)',
        line: 'var(--border-primary)',
        'line-secondary': 'var(--border-secondary)',
        accent: 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-hover': 'var(--accent-hover)',
      },
      boxShadow: {
        // rgb(from ...) is CSS relative color syntax (Chrome/Edge 119+,
        // Safari 16.4+, Firefox 128+) — it re-derives r/g/b from whatever
        // --accent-primary currently holds, so these stay in sync with the
        // active palette with zero JS.
        'glow-cyan-sm': '0 0 4px rgb(from var(--accent-primary) r g b / 0.3)',
        'glow-cyan': '0 0 8px rgb(from var(--accent-primary) r g b / 0.45), 0 0 20px rgb(from var(--accent-primary) r g b / 0.2)',
        'glow-cyan-lg': '0 0 12px rgb(from var(--accent-primary) r g b / 0.5), 0 0 28px rgb(from var(--accent-primary) r g b / 0.3), 0 0 48px rgb(from var(--accent-primary) r g b / 0.12)',
        'glow-lime': '0 0 8px rgb(from var(--accent-secondary) r g b / 0.45), 0 0 20px rgb(from var(--accent-secondary) r g b / 0.2)',
        'glow-accent-xs': '0 0 8px rgb(from var(--accent-primary) r g b / 0.3)',
        'glow-accent-sm': '0 0 12px rgb(from var(--accent-primary) r g b / 0.4)',
        'glow-accent-md': '0 0 20px rgb(from var(--accent-primary) r g b / 0.3)',
        'glow-accent-lg': '0 0 24px rgb(from var(--accent-primary) r g b / 0.5)',
        // Layered, realistic elevation
        'elevated': '0 1px 2px rgb(0 0 0 / 0.18), 0 4px 8px rgb(0 0 0 / 0.16), 0 12px 24px rgb(0 0 0 / 0.18)',
      },
      transitionTimingFunction: {
        electric: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        smooth: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
        overshoot: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'gradient-pan': 'gradient-pan 6s ease infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
