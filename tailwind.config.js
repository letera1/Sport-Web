/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Extracted from Figma metadata
        background: "#181921",
        surface: "#1D1E2B",
        primary: "#6D00FF",
        accent: "#00FFA5",
        danger: "#EE5E52", // Red for cards/finished
        warning: "#E7D93F", // Yellow for cards
        text: {
          primary: "#FFFFFF",
          secondary: "#CAC4D0",
          muted: "#938F99",
          dark: "#111827"
        },
        divider: "#292B41",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
