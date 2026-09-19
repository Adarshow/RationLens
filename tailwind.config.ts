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
        paper: "#F4EFDD",
        "paper-dim": "#EAE2C9",
        backwater: {
          DEFAULT: "#1F5C3E",
          light: "#3C7A56",
          dark: "#123B27",
        },
        monsoon: {
          DEFAULT: "#D97B3F",
          light: "#E89A63",
        },
        marigold: {
          DEFAULT: "#A9702F",
          light: "#C98F4E",
          dark: "#7C4F1F",
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
