import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        line: "var(--color-line)",
        stamp: {
          DEFAULT: "var(--color-stamp)",
          dark: "var(--color-stamp-dark)",
        },
        available: {
          DEFAULT: "var(--color-available)",
          bg: "var(--color-available-bg)",
        },
        low: {
          DEFAULT: "var(--color-low)",
          bg: "var(--color-low-bg)",
        },
        out: {
          DEFAULT: "var(--color-out)",
          bg: "var(--color-out-bg)",
        },
        outdated: {
          DEFAULT: "var(--color-outdated)",
          bg: "var(--color-outdated-bg)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-ml)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "var(--font-ml)", "Georgia", "serif"],
      },
      fontSize: {
        body: ["1.0625rem", { lineHeight: "1.6" }],
        title: ["1.75rem", { lineHeight: "1.25", fontWeight: "700" }],
      },
      minHeight: {
        tap: "44px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
