import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        clash: ["Clash Display", "sans-serif"],
      },
      colors: {
        background: "#F1F0EE",
        foreground: "var(--foreground)",
        secondary: "#39498C",
        primary: "#F1B12D",
        "text-gray": "#838282",
        "light-gray": "#F9F9F9",
        "input-border": "#E0E0E0",
        border: "#D8D8D8",
        "pastel-blue": "#DADFF6",
        "dark-blue": "#010C3B",
        "dark-yellow": "#CD9C00",
      },
    },
  },
  plugins: [],
};
export default config;
