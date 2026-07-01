#!/usr/bin/env bash
set -euo pipefail

# ChadWallet — swap the hand-built chart shell for the REAL TradingView Advanced Chart widget
#  (the same product fomo embeds). TradingView renders its own toolbars (interval, drawing tools,
#  indicators, date ranges, log/auto/%, settings, fullscreen, screenshot) and they all WORK natively,
#  so the chart matches fomo exactly. Symbol is mapped from the token (SOL->PYTH:SOLUSD, etc.);
#  chart data is TradingView's feed for that symbol (the rest of the app still uses BirdEye).
#  The BirdEye lightweight-charts renderer stays in PriceChart.tsx (unused) if you want a self-fed chart.
# Run from repo root:  bash apply_fomo_tradingview.sh

if [ ! -f package.json ] || [ ! -d .git ]; then echo "ERROR: run from chadwallet repo root."; exit 1; fi
grep -q '"chadwallet-web"' package.json || { echo "ERROR: not the chadwallet repo."; exit 1; }
if ! grep -q "statsFor" src/lib/derive.ts 2>/dev/null; then echo "NOTE: run apply_terminal_realdata.sh first."; exit 1; fi

mkdir -p "src/components/trade"
cat > "src/components/trade/TradingViewChart.tsx" << 'CHADFOMO_EOF'
"use client";

import React, { useEffect, useRef } from "react";

/* The REAL TradingView Advanced Chart widget — the same product fomo embeds.
   It renders TradingView's own toolbars (interval, drawing tools, indicators, date ranges,
   log/auto/%, settings, fullscreen, screenshot) and they all work natively, so this matches
   fomo exactly. Chart data is TradingView's feed for the mapped symbol (not BirdEye). */

const OVERRIDES: Record<string, string> = {
  SOL: "PYTH:SOLUSD",
  WSOL: "PYTH:SOLUSD",
  BTC: "PYTH:BTCUSD",
  ETH: "PYTH:ETHUSD",
  USDC: "CRYPTO:USDCUSD",
  USDT: "CRYPTO:USDTUSD",
  JUP: "PYTH:JUPUSD",
  BONK: "PYTH:BONKUSD",
  WIF: "PYTH:WIFUSD",
  JITOSOL: "PYTH:JITOSOLUSD",
  PYTH: "PYTH:PYTHUSD",
  RAY: "CRYPTO:RAYUSD",
};

function tvSymbol(sym?: string): string {
  const s = (sym || "SOL").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return OVERRIDES[s] || `CRYPTO:${s}USD`;
}

export function TradingViewChart({ symbol }: { symbol?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    el.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol(symbol),
      interval: "1",
      timezone: "Asia/Kolkata",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(6, 5, 16, 1)",
      gridColor: "rgba(255, 255, 255, 0.04)",
      hide_side_toolbar: false,
      allow_symbol_change: false,
      withdateranges: true,
      save_image: true,
      details: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });
    el.appendChild(script);
    return () => { el.innerHTML = ""; };
  }, [symbol]);

  return <div ref={host} className="tradingview-widget-container h-full w-full" style={{ height: "100%", width: "100%" }} />;
}
CHADFOMO_EOF

mkdir -p "src/components/trade"
cat > "src/components/trade/ChartArea.tsx" << 'CHADFOMO_EOF'
"use client";

import React from "react";
import { Token } from "@/lib/types";
import { TradingViewChart } from "./TradingViewChart";

/* fomo's chart is the TradingView Advanced Chart widget, so ChadWallet embeds the same widget.
   All of TradingView's toolbars/tools are native and functional — an exact match to fomo.
   (Chart data is TradingView's feed for the mapped symbol; the rest of the page uses BirdEye.
   A BirdEye lightweight-charts renderer remains in PriceChart.tsx if a self-fed chart is wanted.) */

export function ChartArea({ token }: { token: Token }) {
  return (
    <div className="flex flex-col bg-bg-primary">
      <div className="h-[460px] w-full">
        <TradingViewChart symbol={token.symbol} />
      </div>
    </div>
  );
}
CHADFOMO_EOF

git add -- "src/components/trade/TradingViewChart.tsx" "src/components/trade/ChartArea.tsx"
if git diff --cached --quiet; then echo "· no changes"; else git commit -q -m "feat(trade): embed real TradingView Advanced Chart widget (working native toolbars, fomo parity)"; echo "commit ok"; fi
rm -rf .next
echo; echo "Applied. Restart:  npm run dev  (hard-refresh /trade). The chart loads TradingView in your browser."
