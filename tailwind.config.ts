import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        aura: {
          cyan: "#22D3EE",
          violet: "#8B5CF6",
          pink: "#EC4899",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "fade-slide-up": "fadeSlideUp 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
        "scale-in": "scale-in 0.2s ease forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient": "gradient-shift 6s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
