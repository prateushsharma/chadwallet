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

function BadgeCheck() {
  return (
    <div className="absolute flex items-center justify-center" style={{ bottom: -3, right: -3 }}>
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path
          fill="rgb(var(--accent-primary))"
          d="M12 1l2.6 1.9 3.2-.2 1 3 2.7 1.7-1 3.1 1 3.1-2.7 1.7-1 3-3.2-.2L12 23l-2.6-1.9-3.2.2-1-3L2.5 15.6l1-3.1-1-3.1L5.2 7.7l1-3 3.2.2z"
        />
        <path fill="#fff" d="M10.6 15.2l-2.3-2.3 1.2-1.2 1.1 1.1 3.4-3.4 1.2 1.2z" />
      </svg>
    </div>
  );
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
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-px overflow-x-hidden overflow-y-scroll px-2 pt-1">
        {tokens.map((t) => {
          const up = t.priceChange24h >= 0;
          const active = t.address === selected;
          const c = up ? "rgb(var(--green))" : "rgb(var(--red))";
          return (
            <button
              key={t.address}
              onClick={() => onSelect(t)}
              onMouseEnter={(e) => setHover({ t, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
              onMouseLeave={() => setHover(null)}
              className={`group flex min-w-0 cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-bg-secondary focus-visible:bg-bg-secondary ${
                active ? "bg-bg-secondary" : ""
              }`}
            >
              {/* icon */}
              <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
                {t.logoURI ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.logoURI}
                    alt=""
                    style={{ width: 36, height: 36 }}
                    className="rounded-full border border-bg-tertiary object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
                  />
                ) : (
                  <span className="block rounded-full border border-bg-tertiary bg-bg-tertiary" style={{ width: 36, height: 36 }} />
                )}
                {VERIFIED.has(t.address) && <BadgeCheck />}
              </div>

              {/* name + price */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm leading-4">{t.name || t.symbol}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">{fmtUsd(t.price)}</div>
              </div>

              {/* market cap + change */}
              <div className="flex shrink-0 flex-col items-end gap-0.5 tabular-nums">
                <div className="text-sm leading-4">
                  <span>{mcShort(t.marketCap)}</span> MC
                </div>
                <div className="flex items-center gap-[3px]" style={{ lineHeight: "16px" }}>
                  <span style={{ color: c, fontWeight: 400, fontSize: "6px" }}>{up ? "▲" : "▼"}</span>
                  <span style={{ fontSize: "12px", fontWeight: 500, color: c }}>{Math.abs(t.priceChange24h).toFixed(2)}%</span>
                </div>
              </div>
            </button>
          );
        })}
        {tokens.length === 0 && <p className="p-4 text-center text-sm text-text-tertiary">Loading trending…</p>}
      </div>

      {hover && <HoverCard token={hover.t} x={hover.x} y={hover.y} />}
    </>
  );
}

function HoverCard({ token, x, y }: { token: Token; x: number; y: number }) {
  const up = token.priceChange24h >= 0;
  const left = Math.min(x + 16, (typeof window !== "undefined" ? window.innerWidth : 1200) - 280);
  const top = Math.min(y + 12, (typeof window !== "undefined" ? window.innerHeight : 800) - 230);
  return (
    <div
      className="pointer-events-none fixed z-50 w-64 rounded-xl border border-bg-tertiary bg-bg-secondary/95 p-3 shadow-panel backdrop-blur"
      style={{ left, top }}
    >
      <div className="flex items-center gap-2">
        {token.logoURI ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={token.logoURI} alt="" className="h-9 w-9 rounded-full border border-bg-tertiary object-cover" />
        ) : (
          <span className="h-9 w-9 rounded-full border border-bg-tertiary bg-bg-tertiary" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">{token.name || token.symbol}</p>
          <p className="truncate text-xs text-text-secondary">{token.symbol}</p>
        </div>
        <span className="ml-auto text-sm font-medium" style={{ color: up ? "rgb(var(--green))" : "rgb(var(--red))" }}>{fmtPct(token.priceChange24h)}</span>
      </div>
      <p className="mt-2 text-lg font-bold text-text-primary">{fmtUsd(token.price)}</p>
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
      <span className="text-text-secondary">{k}</span>
      <span className="text-text-primary">{v}</span>
    </div>
  );
}
