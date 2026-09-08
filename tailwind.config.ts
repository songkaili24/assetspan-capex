import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#18181B",
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
        },
        gold: {
          DEFAULT: "#B45309",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        chart: {
          projection: "#3B82F6",
          underBudget: "#10B981",
          overBudget: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-spline-sans-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "figure-sm": ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "-0.01em" }],
        figure: ["0.875rem", { lineHeight: "1.375rem", letterSpacing: "-0.01em" }],
        "figure-lg": ["1.125rem", { lineHeight: "1.5rem", letterSpacing: "-0.02em" }],
        "figure-xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.03em" }],
        "figure-2xl": ["2rem", { lineHeight: "2.375rem", letterSpacing: "-0.04em" }],
        "figure-3xl": ["2.75rem", { lineHeight: "3rem", letterSpacing: "-0.05em" }],
      },
      boxShadow: {
        panel: "0 1px 2px 0 rgb(24 24 27 / 0.06), 0 1px 3px 0 rgb(24 24 27 / 0.08)",
        overlay: "0 10px 38px -10px rgb(24 24 27 / 0.28), 0 10px 20px -15px rgb(24 24 27 / 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
