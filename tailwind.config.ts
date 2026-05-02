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
