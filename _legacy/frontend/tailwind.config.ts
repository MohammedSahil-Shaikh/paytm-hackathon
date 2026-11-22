import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdcff",
          300: "#8ec6ff",
          400: "#59a6ff",
          500: "#3381ff",
          600: "#1b5ff5",
          700: "#144ae1",
          800: "#173db6",
          900: "#19368f",
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef1f6",
          200: "#d9dee8",
          300: "#b7c0d0",
          400: "#8b97ad",
          500: "#6b7891",
          600: "#556074",
          700: "#454e5f",
          800: "#3b4250",
          900: "#1f2430",
          950: "#12151c",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(18, 21, 28, 0.04), 0 8px 24px rgba(18, 21, 28, 0.04)",
        panel: "0 1px 2px rgba(18, 21, 28, 0.03), 0 12px 32px rgba(18, 21, 28, 0.06)",
      },
      backgroundImage: {
        "app-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(51, 129, 255, 0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(25, 54, 143, 0.06), transparent)",
      },
    },
  },
  plugins: [],
};

export default config;
