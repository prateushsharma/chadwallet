import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ChadWallet palette — matched to fomo.family (bg #060510 confirmed from their site)
        ink: {
          DEFAULT: "#060510", // bg-primary (page) — deep blue-black
          900: "#060510", // bg-primary
          800: "#131120", // bg-secondary — cards / inputs / buttons (clearly lifted)
          700: "#1C1A2B", // hover mid
          600: "#262438", // bg-tertiary — borders / hover / active chips
          500: "#322F47", // lighter divider
        },
        bone: "#F6F6FB", // text-primary (near-white)
        muted: "#9C9BAB", // text-secondary
        dim: "#6B6A7B", // text-tertiary (placeholders, "$", muted icons)
        chad: {
          DEFAULT: "#40DF88", // brand green (Buy)
          dim: "#28B368",
          glow: "#6BFFB0",
        },
        sol: "#14F195", // Solana green accent
        ember: "#FF622E", // sell / down
        mint: "#40DF88", // buy / up
        accent: "#6E5CF7", // fomo indigo — deposit / checks / fees / positions
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
        glow: "0 0 0 1px rgba(64,223,136,0.25), 0 0 36px -8px rgba(64,223,136,0.5)",
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
