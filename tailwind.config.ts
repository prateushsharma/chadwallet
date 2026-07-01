import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ChadWallet palette — sampled from the real app + brand kit
        ink: {
          DEFAULT: "#0A0A0D", // neutral near-black (fomo-like)
          900: "#0A0A0D",
          800: "#101014",
          700: "#16161C",
          600: "#20212A", // borders
          500: "#2B2C36", // dividers / scrollbar
        },
        bone: "#EDEFF3", // near-white text
        muted: "#888B96", // neutral grey secondary text
        chad: {
          DEFAULT: "#26ED80", // brand green (Buy pill)
          dim: "#1FBE67",
          glow: "#5BFFA6",
        },
        sol: "#14F195", // Solana green accent (active states)
        ember: "#FF622E", // sell / down (fomo)
        mint: "#26ED80", // buy / up
        accent: "#606AF7", // fomo indigo — deposit / checks / fees / positions
        // marketing gradient stops (blue -> teal -> mint)
        brandblue: "#2594FF",
        brandteal: "#3FD3D0",
        brandmint: "#8DDFCE",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(38,237,128,0.25), 0 0 36px -8px rgba(38,237,128,0.5)",
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 70px -34px rgba(0,0,0,0.95)",
      },
      animation: {
        marquee: "marquee var(--marquee-duration,40s) linear infinite",
        "marquee-rev": "marquee-rev var(--marquee-duration,40s) linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-rev": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
