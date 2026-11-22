import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        navy: {
          950: "#050d1a",
          900: "#0a1628",
          800: "#10233f",
          700: "#183456",
          600: "#234872",
        },
        gold: {
          400: "#ffd54a",
          500: "#f5c518",
          600: "#d4a017",
        },
        ink: {
          50: "#f7f4ea",
          100: "#efe9d6",
          300: "#b8c0d0",
          400: "#8fa0b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
        display: ["var(--font-sora)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245,197,24,0.18), 0 24px 60px rgba(0,0,0,0.35)",
        soft: "0 18px 40px rgba(5,13,26,0.45)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.8s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
