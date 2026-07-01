"use client";

import React, { useState } from "react";
import { Token } from "@/lib/types";
import { fmtUsd, fmtPct } from "@/lib/format";

const TABS = ["Alerts", "Tokens", "Leaderboard", "Feed"] as const;
type Tab = (typeof TABS)[number];
const CHIPS = ["Watchlist", "Crypto", "Trending", "Most held", "Graduated", "Bonding"] as const;

// blue-chip Solana mints that get fomo's verified badge-check
const VERIFIED = new Set<string>([
  "So11111111111111111111111111111111111111112",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
]);

// fomo compact market cap: $5.9M, $420.4K, $1M, $716K
function mcShort(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  const t = (x: number) => x.toFixed(1).replace(/\.0$/, "");
  if (n >= 1e9) return `$${t(n / 1e9)}B`;
  if (n >= 1e6) return `$${t(n / 1e6)}M`;
  if (n >= 1e3) return `$${t(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

export function LeftPanel({
  tokens,
  selected,
  onSelect,
}: {
  token: Token;
  tokens: Token[];
  selected: string;
  onSelect: (t: Token) => void;
}) {
  const [tab, setTab] = useState<Tab>("Tokens");
  const [chip, setChip] = useState<string>("Trending");
  const [hover, setHover] = useState<{ t: Token; x: number; y: number } | null>(null);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-bg-tertiary pb-2">
      {/* nav */}
      <div className="flex shrink-0 items-center rounded-t-xl bg-bg-secondary p-2 pl-3">
        <div className="relative min-w-0 flex-1">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto overflow-y-hidden text-sm font-medium">
            <button
              onClick={() => setTab("Alerts")}
              className={`flex flex-none items-center justify-start gap-1 whitespace-nowrap text-left hover:text-text-primary ${tab === "Alerts" ? "" : "text-text-secondary"}`}
            >
              <span className="relative flex shrink-0 items-center justify-center">
                <svg width="14" height="14"><use href="/images/sprite.svg#bell-filled" /></svg>
                <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border border-bg-secondary bg-red" aria-hidden="false" />
              </span>
              <span>Alerts</span>
            </button>
            <div className="h-4 w-px bg-bg-tertiary/40" aria-hidden="true" />
            <button onClick={() => setTab("Tokens")} className={`flex-none whitespace-nowrap text-left hover:text-text-primary focus:text-text-primary focus:outline-none ${tab === "Tokens" ? "" : "text-text-secondary"}`}>Tokens</button>
            <div className="h-4 w-px bg-bg-tertiary/40" aria-hidden="true" />
            <button onClick={() => setTab("Leaderboard")} className={`flex-none whitespace-nowrap text-left hover:text-text-primary ${tab === "Leaderboard" ? "" : "text-text-secondary"}`}>Leaderboard</button>
            <div className="h-4 w-px bg-bg-tertiary/40" aria-hidden="true" />
            <button onClick={() => setTab("Feed")} className={`flex-none whitespace-nowrap text-left hover:text-text-primary ${tab === "Feed" ? "" : "text-text-secondary"}`}>Feed</button>
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button className="p-1 text-text-tertiary hover:text-text-primary focus:outline-none" aria-label="Collapse discovery panel">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
              <path d="M7.25609 11.911C7.58193 12.2369 7.58193 12.7636 7.25609 13.0894C7.09359 13.2519 6.88023 13.3336 6.6669 13.3336C6.45357 13.3336 6.24021 13.2519 6.07771 13.0894L0.244375 7.25609C-0.0814583 6.93026 -0.0814583 6.40354 0.244375 6.07771L6.07771 0.244375C6.40354 -0.0814583 6.93026 -0.0814583 7.25609 0.244375C7.58193 0.570208 7.58193 1.09693 7.25609 1.42276L2.01195 6.6669L7.25609 11.911ZM7.84529 6.6669L13.0894 1.42276C13.4153 1.09693 13.4153 0.570208 13.0894 0.244375C12.7636 -0.0814583 12.2369 -0.0814583 11.911 0.244375L6.07771 6.07771C5.75187 6.40354 5.75187 6.93026 6.07771 7.25609L11.911 13.0894C12.0735 13.2519 12.2869 13.3336 12.5002 13.3336C12.7136 13.3336 12.9269 13.2519 13.0894 13.0894C13.4153 12.7636 13.4153 12.2369 13.0894 11.911L7.84529 6.6669Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {tab === "Tokens" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* chips */}
          <div className="relative shrink-0">
            <div className="no-scrollbar flex cursor-grab gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap px-3 pb-1 pt-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChip(c)}
                  className={`inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-bg-tertiary-solid px-1.5 text-xs font-bold leading-none hover:bg-bg-tertiary-solid focus:bg-bg-tertiary-solid focus:outline-none ${chip === c ? "bg-bg-tertiary-solid" : "text-text-secondary"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l to-transparent from-bg-primary" />
          </div>

          {/* token list */}
          <div className="flex min-h-0 flex-1 flex-col gap-px overflow-x-hidden overflow-y-scroll px-2 pt-1">
            {tokens.map((t) => {
              const up = t.priceChange24h >= 0;
              const c = up ? "rgb(33, 201, 94)" : "rgb(255, 98, 46)";
              return (
                <div key={t.address} className="grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-150 ease-out">
                  <div className="overflow-hidden">
                    <button
                      onClick={() => onSelect(t)}
                      onMouseEnter={(e) => setHover({ t, x: e.clientX, y: e.clientY })}
                      onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                      onMouseLeave={() => setHover(null)}
                      className="group flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg p-2 py-2 hover:bg-bg-secondary focus-visible:bg-bg-secondary"
                    >
                      <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
                        {t.logoURI ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            style={{ height: 36, width: 36 }}
                            className="rounded-full border border-bg-tertiary object-cover"
                            src={t.logoURI}
                            alt=""
                            onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
                          />
                        ) : (
                          <span className="block rounded-full border border-bg-tertiary bg-bg-tertiary" style={{ height: 36, width: 36 }} />
                        )}
                        {VERIFIED.has(t.address) && (
                          <div className="absolute flex items-center justify-center" style={{ bottom: -3, right: -3 }}>
                            <svg style={{ width: 16, height: 16 }}><use href="/images/sprite.svg#badge-check" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-sm leading-4">{t.name || t.symbol}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">{fmtUsd(t.price)}</div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5 tabular-nums">
                        <div className="text-sm leading-4">
                          <span>{mcShort(t.marketCap)}</span> MC
                        </div>
                        <div className="flex items-center gap-0.75" style={{ lineHeight: "16px" }}>
                          <div style={{ color: c, fontWeight: 400, fontSize: "6px" }}>{up ? "▲" : "▼"}</div>
                          <div style={{ fontSize: "12px", fontWeight: 500, color: c }}>{Math.abs(t.priceChange24h).toFixed(2)}%</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
            {tokens.length === 0 && <p className="p-4 text-center text-sm text-text-tertiary">Loading trending…</p>}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-text-tertiary">
          {tab === "Alerts" ? "No alerts yet." : tab === "Leaderboard" ? "Leaderboard coming soon." : "Feed coming soon."}
        </div>
      )}

      {/* split buttons */}
      <div className="mx-2 mt-1 flex items-center gap-2">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-bg-tertiary bg-bg-secondary py-1 text-xs text-text-tertiary hover:text-text-primary hover:opacity-80 focus:outline-none" aria-label="Split into rows">
          <svg width="14" height="14"><use href="/images/sprite.svg#rows" /></svg>
          <span>Split bottom</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-bg-tertiary bg-bg-secondary py-1 text-xs text-text-tertiary hover:text-text-primary hover:opacity-80 focus:outline-none" aria-label="Add discovery column">
          <svg width="14" height="14"><use href="/images/sprite.svg#columns" /></svg>
          <span>Split right</span>
        </button>
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
    <div className="pointer-events-none fixed z-50 w-64 rounded-xl border border-bg-tertiary bg-bg-secondary/95 p-3 shadow-panel backdrop-blur" style={{ left, top }}>
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
        <span className="ml-auto text-sm font-medium" style={{ color: up ? "rgb(33, 201, 94)" : "rgb(255, 98, 46)" }}>{fmtPct(token.priceChange24h)}</span>
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
