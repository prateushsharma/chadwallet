"use client";

import React, { useState } from "react";
import { Token } from "@/lib/types";
import { fmtUsd, fmtPct } from "@/lib/format";

// blue-chip Solana mints that get fomo's verified badge-check
const VERIFIED = new Set<string>([
  "So11111111111111111111111111111111111111112", // SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", // JUP
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", // WIF
]);

// fomo-style compact market cap: $5.9M, $420.4K, $1M, $716K
function mcShort(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  const t = (x: number) => x.toFixed(1).replace(/\.0$/, "");
  if (n >= 1e9) return `$${t(n / 1e9)}B`;
  if (n >= 1e6) return `$${t(n / 1e6)}M`;
  if (n >= 1e3) return `$${t(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

export function TrendingList({
  tokens,
  selected,
  onSelect,
}: {
  tokens: Token[];
  selected: string;
  onSelect: (t: Token) => void;
}) {
  const [hover, setHover] = useState<{ t: Token; x: number; y: number } | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scroll-thin flex flex-1 flex-col gap-px overflow-x-hidden overflow-y-auto px-2 pt-1">
        {tokens.map((t) => {
          const up = t.priceChange24h >= 0;
          const active = t.address === selected;
          const verified = VERIFIED.has(t.address);
          return (
            <button
              key={t.address}
              onClick={() => onSelect(t)}
              onMouseEnter={(e) => setHover({ t, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
              onMouseLeave={() => setHover(null)}
              className={`group flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${
                active ? "bg-ink-800" : "hover:bg-ink-800"
              }`}
            >
              {/* icon (+ verified badge) */}
              <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
                {t.logoURI ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.logoURI}
                    alt=""
                    style={{ width: 36, height: 36 }}
                    className="rounded-full border border-ink-600 bg-ink-700 object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
                  />
                ) : (
                  <span
                    className="block rounded-full border border-ink-600 bg-ink-700"
                    style={{ width: 36, height: 36 }}
                  />
                )}
                {verified && (
                  <span
                    className="absolute grid place-items-center rounded-full bg-accent ring-2 ring-ink-900"
                    style={{ bottom: -2, right: -2, width: 15, height: 15 }}
                  >
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </div>

              {/* name + price */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm font-medium leading-4 text-bone">{t.name || t.symbol}</span>
                </div>
                <div className="truncate text-xs text-muted">{fmtUsd(t.price)}</div>
              </div>

              {/* market cap + 24h change */}
              <div className="flex shrink-0 flex-col items-end gap-0.5 tabular-nums">
                <div className="text-sm font-medium leading-4 text-bone">
                  {mcShort(t.marketCap)} <span className="font-normal text-muted">MC</span>
                </div>
                <div className={`flex items-center gap-0.5 ${up ? "text-mint" : "text-ember"}`}>
                  <span style={{ fontSize: 7, lineHeight: 1 }}>{up ? "▲" : "▼"}</span>
                  <span className="text-xs font-medium">{Math.abs(t.priceChange24h).toFixed(2)}%</span>
                </div>
              </div>
            </button>
          );
        })}
        {tokens.length === 0 && <p className="p-4 text-center text-sm text-muted">Loading trending…</p>}
      </div>

      {hover && <HoverCard token={hover.t} x={hover.x} y={hover.y} />}
    </div>
  );
}

function HoverCard({ token, x, y }: { token: Token; x: number; y: number }) {
  const up = token.priceChange24h >= 0;
  const left = Math.min(x + 16, (typeof window !== "undefined" ? window.innerWidth : 1200) - 280);
  const top = Math.min(y + 12, (typeof window !== "undefined" ? window.innerHeight : 800) - 230);
  return (
    <div
      className="pointer-events-none fixed z-50 w-64 rounded-xl border border-ink-600 bg-ink-800/95 p-3 shadow-panel backdrop-blur"
      style={{ left, top }}
    >
      <div className="flex items-center gap-2">
        {token.logoURI ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={token.logoURI} alt="" className="h-9 w-9 rounded-full border border-ink-600 bg-ink-700 object-cover" />
        ) : (
          <span className="h-9 w-9 rounded-full border border-ink-600 bg-ink-700" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-bone">{token.name || token.symbol}</p>
          <p className="truncate text-xs text-muted">{token.symbol}</p>
        </div>
        <span className={`ml-auto text-sm font-medium ${up ? "text-mint" : "text-ember"}`}>{fmtPct(token.priceChange24h)}</span>
      </div>
      <p className="mt-2 text-lg font-bold text-bone">{fmtUsd(token.price)}</p>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <Row k="Market cap" v={fmtUsd(token.marketCap, { compact: true })} />
        <Row k="Liquidity" v={fmtUsd(token.liquidity, { compact: true })} />
        <Row k="24h vol" v={fmtUsd(token.volume24h, { compact: true })} />
        <Row k="24h chg" v={fmtPct(token.priceChange24h)} />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{k}</span>
      <span className="text-bone">{v}</span>
    </div>
  );
}
