"use client";

import React, { useState } from "react";
import { Token, TokenOverview } from "@/lib/types";
import { statsFor } from "@/lib/derive";
import { fmtUsd, shortAddr } from "@/lib/format";

const trim = (x: number) => x.toFixed(1).replace(/\.0$/, "");
function short(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  if (n >= 1e9) return `$${trim(n / 1e9)}B`;
  if (n >= 1e6) return `$${trim(n / 1e6)}M`;
  if (n >= 1e3) return `$${trim(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}
function numShort(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  if (n >= 1e9) return `${trim(n / 1e9)}B`;
  if (n >= 1e6) return `${trim(n / 1e6)}M`;
  if (n >= 1e3) return `${trim(n / 1e3)}K`;
  return `${Math.round(n)}`;
}

export function TokenHeader({ token, overview }: { token: Token; overview: TokenOverview | null }) {
  const s = statsFor(token, overview);
  const up = s.ch1d >= 0;
  const c = up ? "rgb(33, 201, 94)" : "rgb(255, 98, 46)";
  const dash = (v: string) => (s.live ? v : "—");
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const xSearch = `https://x.com/search?q=${encodeURIComponent(token.address)}%20OR%20%24${token.symbol}`;
  const website = s.website || `https://solscan.io/token/${token.address}`;
  const twitter = s.twitter || xSearch;
  const telegram = s.telegram || xSearch;

  return (
    <div className="border-b border-bg-tertiary px-3 py-2">
      <div className="flex w-full items-center gap-3">
        {/* icon */}
        <button type="button" aria-label="View token image">
          <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
            {token.logoURI ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img style={{ height: 40, width: 40 }} className="rounded-full border border-bg-tertiary object-cover" src={token.logoURI} alt="" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
            ) : (
              <span className="block rounded-full border border-bg-tertiary bg-bg-tertiary" style={{ height: 40, width: 40 }} />
            )}
            <div className="absolute flex items-center justify-center" style={{ bottom: -4, right: -4 }}>
              <svg style={{ width: 18, height: 18 }}><use href="/images/sprite.svg#badge-check" /></svg>
            </div>
          </div>
        </button>

        {/* symbol / socials / name / address */}
        <div className="flex w-52 shrink-0 flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="text-base leading-tight">{token.symbol}</div>
            <svg width="20" height="20" className="shrink-0 text-text-secondary transition-colors hover:text-text-primary"><use href="/images/sprite.svg#solana-logo" /></svg>
            <div className="mx-0.5 h-4 w-px bg-bg-tertiary" />
            <div className="flex items-center gap-1">
              <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center overflow-hidden rounded-sm bg-bg-tertiary p-0.5 text-text-secondary transition-colors hover:text-text-primary">
                <svg width="16" height="16"><use href="/images/sprite.svg#globe" /></svg>
              </a>
              <a href={twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center overflow-hidden rounded-sm bg-bg-tertiary p-0.5 text-text-secondary transition-colors hover:text-text-primary">
                <svg width="16" height="16"><use href="/images/sprite.svg#twitter-logo" /></svg>
              </a>
              <a href={telegram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center overflow-hidden rounded-sm bg-bg-tertiary p-0.5 text-text-secondary transition-colors hover:text-text-primary">
                <svg width="16" height="16"><use href="/images/sprite.svg#telegram" /></svg>
              </a>
              <a href={xSearch} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center overflow-hidden rounded-sm bg-bg-tertiary p-0.5 text-text-secondary transition-colors hover:text-text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search" aria-hidden="true">
                  <path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />
                </svg>
              </a>
            </div>
            <button aria-label="Watchlist">
              <svg className="size-4 text-text-tertiary hover:text-text-primary"><use href="/images/sprite.svg#star-empty" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="max-w-32 truncate text-xs text-text-secondary">{token.name}</div>
            <div className="h-3 w-px bg-bg-tertiary" />
            <button type="button" onClick={copy} className="flex items-center gap-1 transition-opacity hover:opacity-70" aria-label="Copy address">
              <div className="text-xs text-text-tertiary">{shortAddr(token.address, 6)}</div>
              <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check h-4 w-4 text-green" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy h-4 w-4 text-text-tertiary" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* stats */}
        <div className="relative ml-auto min-w-0 flex-1">
          <div className="no-scrollbar overflow-x-auto overflow-y-hidden">
            <div className="flex w-full">
              <div className="ml-auto">
                <div className="flex w-max shrink-0 items-center gap-2 tabular-nums">
                  {/* price */}
                  <div className="flex w-26 cursor-default flex-col items-center py-2">
                    <div className="text-xs text-text-secondary">Price</div>
                    <div className="text-lg font-medium leading-tight tabular-nums">
                      <span className="tabular-nums">{fmtUsd(s.price)}</span>
                    </div>
                  </div>
                  <StatBox label="Market cap" value={dash(short(s.marketCap))} />
                  {/* 24H change */}
                  <div className="flex min-w-22 flex-col items-center rounded-lg bg-bg-secondary px-2 py-1.5">
                    <div className="whitespace-nowrap text-xs text-text-secondary">24H change</div>
                    <div className="flex min-h-5 items-center whitespace-nowrap text-sm">
                      {s.live ? (
                        <div className="flex items-center gap-0.75" style={{ lineHeight: "20px" }}>
                          <div style={{ color: c, fontWeight: 400, fontSize: "8px" }}>{up ? "▲" : "▼"}</div>
                          <div style={{ fontSize: "14px", fontWeight: 500, color: c }}>{Math.abs(s.ch1d).toFixed(2)}%</div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                  <StatBox label="24H Vol." value={dash(short(s.volume24h))} />
                  <StatBox label="Liquidity" value={dash(short(s.liquidity))} />
                  <StatBox label="Holders" value={dash(s.holders ? numShort(s.holders) : "—")} />
                  <StatBox label="Top 10 holding" value={s.top10 ? `${s.top10.toFixed(2)}%` : "-"} />
                </div>
              </div>
              <div className="w-4 shrink-0" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-22 flex-col items-center rounded-lg bg-bg-secondary px-2 py-1.5">
      <div className="whitespace-nowrap text-xs text-text-secondary">{label}</div>
      <div className="flex min-h-5 items-center whitespace-nowrap text-sm">{value}</div>
    </div>
  );
}
