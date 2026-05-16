import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: "#f7f6ef",
          100: "#eff0e4",
          200: "#dcddc7",
          300: "#cfceb7",
          400: "#acb19e",
          500: "#9d916a",
          600: "#9d6745",
          700: "#584a3b",
          800: "#3a2f26",
          900: "#17140f",
        },
        // Brand color palette
        brand: {
          // Backgrounds
          "bg-primary": "#f5f0eb",
          "bg-secondary": "#faf6f2",
          "bg-tertiary": "#fbf8f4",
          "bg-warm": "#fff7f4",
          "bg-dark": "#211914",
          "bg-darker": "#1b1511",
          "bg-darkest": "#17110d",
          
          // Text colors
          "text-primary": "#1b1511",
          "text-secondary": "#6b5f55",
          "text-tertiary": "#7a6e65",
          "text-muted": "#9a8d82",
          "text-light": "#f4e9dc",
          "text-lighter": "#ead7c3",
          "text-accent": "#9a6b4e",
          
          // Border colors
          "border-primary": "#d9cfc6",
          "border-secondary": "#c4b5a8",
          "border-light": "#e4d9d0",
          "border-lighter": "#eadfd4",
          
          // Overlay colors
          "overlay-dark": "rgba(27, 21, 17, 0.88)",
          "overlay-medium": "rgba(27, 21, 17, 0.52)",
          "overlay-light": "rgba(27, 21, 17, 0.24)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        display: ["var(--font-display)", "serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(23, 20, 15, 0.12)",
      },
      backgroundImage: {
        "earthware-radial":
          "radial-gradient(circle at top left, rgba(157, 103, 69, 0.18), transparent 32%), radial-gradient(circle at right center, rgba(172, 177, 158, 0.35), transparent 28%), linear-gradient(180deg, #f7f6ef 0%, #efefe6 48%, #ece6d5 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
