/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        'surface-hover': "rgb(var(--color-surface-hover) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        'card-hover': "rgb(var(--color-card-hover) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        live: "rgb(var(--color-live) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        navbar: "rgb(var(--color-navbar) / <alpha-value>)",
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        },
        divider: "rgb(var(--color-divider) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        overlay: "rgb(var(--color-overlay) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['DM Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-surface': 'linear-gradient(180deg, rgb(var(--color-surface)), rgb(var(--color-background)))',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
        'nav': '0 1px 0 rgba(255,255,255,0.04)',
        'glow-accent': '0 0 16px rgba(0, 230, 118, 0.12)',
        'glow-live': '0 0 12px rgba(255, 179, 0, 0.2)',
        'inset-border': 'inset 0 -1px 0 rgba(var(--color-divider), 0.5)',
      },
      maxWidth: {
        'app': '1200px',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideInFromBottom 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideInFromRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'live-pulse': 'livePulse 1.8s ease-in-out infinite',
        'score-flash': 'scoreFlash 0.6s ease-out',
      },
    },
  },
  plugins: [],
}
