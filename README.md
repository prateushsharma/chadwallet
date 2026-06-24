# ChadWallet — Web

> Trade everything on Solana. Like a Chad.

A `fomo.family`-style landing page **plus** a full trading terminal, built for the
ChadWallet Founding Engineer screen. Next.js 14 (App Router) + Tailwind, real
on-chain data via **BirdEye** + **Jupiter**, sign-in via **Privy**, Solana-native.

The app runs **fully in mock mode with zero keys**, so you can `npm run dev` and
see a completely populated UI immediately. Add keys to switch on live data and
real auth — nothing else changes.

---

## Quick start

```bash
npm install
cp .env.example .env.local      # optional — app runs without it
npm run dev                     # http://localhost:3000
```

Build / run production:

```bash
npm run build && npm run start
```

---

## What's built

### Landing page — `/`
- Sticky navbar with Privy sign-in
- **Rotating LED token tickers at the top and bottom** — pulled live from BirdEye
  trending, scrolling in opposite directions. **Tapping any token opens it in the
  trading terminal.**
- Asymmetric hero with a live "trending" mini-terminal
- Features + how-it-works sections
- Download CTA wired to the **real** store links:
  - Android: `https://play.google.com/store/apps/details?id=xyz.chadwallet.www`
  - iOS: `https://apps.apple.com/us/app/chadwallet/id6757367474`

### Trading terminal — `/trade`
Three-column layout (responsive — collapses to tabs on mobile):
- **Left** — trending tokens list with search
- **Middle** — token header (price, mcap, liquidity, 24h vol), a TradingView
  `lightweight-charts` candlestick + volume chart, and a tabbed panel for
  **live trades** and **top holders**
- **Right** — buy / sell swap panel with **live Jupiter quotes**, quick-amount
  buttons, price-impact + route display, and a **position / PnL tracker**

Deep-linkable: `/trade?token=<mint>`.

---

## Architecture

```
src/
  app/
    layout.tsx            # fonts (via <link>), Privy providers, metadata
    page.tsx              # landing
    trade/page.tsx        # terminal (Suspense around the client terminal)
    providers.tsx         # Privy provider w/ graceful no-key demo mode
    api/
      trending/           # BirdEye token list  -> mock fallback
      token/[address]/    # BirdEye overview     -> mock fallback
      holders/[address]/  # BirdEye holders      -> mock fallback
      trades/[address]/   # BirdEye swaps        -> mock fallback
      candles/[address]/  # BirdEye OHLCV        -> mock fallback
      quote/              # Jupiter quote (keyless)
  components/
    Navbar, TokenBanner, Hero, Features, Download, AuthButton, Logo
    trade/ TrendingList, PriceChart, TokenPanels, SwapPanel, TradeTerminal
  lib/
    birdeye.ts            # server-only BirdEye client + typed mappers
    jupiter.ts            # Jupiter quote client
    api.ts                # client-side fetchers
    mock.ts               # curated Solana tokens + deterministic generators
    format.ts, types.ts
```

**Design decisions worth calling out**

- **Keys stay server-side.** The browser only ever talks to our own `/api/*`
  routes; `BIRDEYE_API_KEY` is never shipped to the client. The routes attach
  short `revalidate` windows so live data stays fresh without hammering the API.
- **Graceful degradation.** Every data route tries the real provider and falls
  back to mock data on any failure, so the UI is never empty — great for demos
  and resilient in production.
- **Deterministic mock generators** (seeded by token address) so SSR and client
  output match and there's no hydration drift.
- **Privy demo mode.** With no `NEXT_PUBLIC_PRIVY_APP_ID`, the app still builds
  and runs; the sign-in button explains how to enable real auth.

---

## Environment variables

| Variable | Required? | What it unlocks |
| --- | --- | --- |
| `NEXT_PUBLIC_PRIVY_APP_ID` | optional | Apple / Google sign-in via Privy |
| `BIRDEYE_API_KEY` | optional | Live prices, charts, holders, trades |
| `NEXT_PUBLIC_SOLANA_RPC` | optional | RPC for balances / sending swaps |

All have free tiers:
- Privy — https://dashboard.privy.io
- BirdEye — https://birdeye.so/data-api
- Alchemy RPC — https://www.alchemy.com/rpc-api

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel            # link + deploy a preview
vercel --prod     # production
```

Add the three env vars in **Vercel → Project → Settings → Environment
Variables**, then redeploy. That's your live preview link for the reviewer.

---

## Notes / next steps

- **Brand assets are wired in.** The official Gigachad logo, app screenshots, and
  promo video from the brand kit live in `public/brand` and `public/shots`. The
  palette (navy `#020817` + green `#26ED80`) and the blue→teal→mint marketing
  gradient are sampled directly from the brand kit / app store art.
- **Swap execution** is a session simulation today (quotes are live). Wiring the
  Privy embedded-wallet signer + Jupiter `/swap` transaction is the natural
  follow-up; `NEXT_PUBLIC_SOLANA_RPC` is already plumbed for it.
- **BirdEye field mapping** in `lib/birdeye.ts` is written defensively against
  their current schema; if a field name drifts, it's a one-line change there.

---

Built with Next.js 14, Tailwind, lightweight-charts, Privy, BirdEye, Jupiter.
