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
        ink: "#10262B",
        paper: "#F1EDE4",
        "paper-dim": "#E8E2D4",
        backwater: {
          DEFAULT: "#1F5C57",
          light: "#2E7A73",
          dark: "#153F3B",
        },
        monsoon: {
          DEFAULT: "#2B3A67",
          light: "#3D4F85",
        },
        marigold: {
          DEFAULT: "#E0A458",
          light: "#F0C48A",
          dark: "#B87F3A",
        },
        laterite: {
          DEFAULT: "#B23A2E",
          light: "#D45B4E",
        },
        leaf: {
          DEFAULT: "#2F8F5B",
          light: "#4FAF7A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-ml)", "sans-serif"],
      },
      minHeight: {
        tap: "44px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 38, 43, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
