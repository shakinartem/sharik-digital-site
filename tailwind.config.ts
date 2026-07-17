import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F5",
        foreground: "#061C41",
        surface: "#FFFFFF",
        "surface-alt": "#E7E7E7",
        muted: "#F0F0F0",
        "muted-foreground": "#6B7280",
        border: "rgba(6, 28, 65, 0.08)",
        primary: "#760229",
        "primary-hover": "#5E0120",
        "primary-soft": "rgba(118, 2, 41, 0.06)",
        accent: "#9B002F",
        "accent-hover": "#7D0025",
        premium: "#2A132D",
      },
      borderRadius: {
        section: "2rem",
        card: "1.75rem",
        "card-sm": "1.45rem",
        full: "9999px",
      },
      boxShadow: {
        "card": "0 4px 24px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 20px 60px -16px rgba(0, 0, 0, 0.12)",
        "header": "0 16px 50px -20px rgba(24, 24, 27, 0.32)",
        "soft": "0 24px 80px rgba(15, 23, 42, 0.08)",
      },
      maxWidth: {
        container: "1200px",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;