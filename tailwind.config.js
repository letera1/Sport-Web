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
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, rgb(var(--color-primary)), #9D4EDD)',
        'gradient-accent': 'linear-gradient(135deg, rgb(var(--color-accent)), #00C896)',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(0, 255, 165, 0.15)',
        'glow-primary': '0 0 20px rgba(109, 0, 255, 0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideInFromBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
