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
          950: "#1C1C1C",
          900: "#F5F2EA",
          800: "#FFFFFF",
          700: "#FFF8E8",
          600: "#EAE5D9",
        },
        gold: {
          400: "#E5B94C",
          500: "#F4C430",
          600: "#C9A227",
        },
        ink: {
          50: "#1C1C1C",
          100: "#2A2A2A",
          200: "#404040",
          300: "#737373",
          400: "#A3A3A3",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
        display: ["var(--font-sora)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 1px 0 rgba(28,28,28,0.04), 0 16px 40px rgba(28,28,28,0.06)",
        soft: "0 12px 30px rgba(28,28,28,0.08)",
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
