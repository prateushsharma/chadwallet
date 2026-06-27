"use client";

import React from "react";
import { Token } from "@/lib/types";
import { deriveStats } from "@/lib/derive";
import { fmtUsd, fmtPct, fmtNum, shortAddr } from "@/lib/format";

const ICONS: { title: string; path: string; stroke?: boolean }[] = [
  { title: "Info", path: "M4 6h16M4 12h16M4 18h16", stroke: true },
  { title: "Edit", path: "M4 20h4L18 10l-4-4L4 16v4zM14 6l4 4", stroke: true },
  { title: "Website", path: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18", stroke: true },
  { title: "X", path: "M4 4l16 16M20 4L4 20", stroke: true },
  { title: "Telegram", path: "M21 5L3 12l5 2 2 5 3-4 4 3z", stroke: true },
  { title: "Search", path: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4-4", stroke: true },
];

export function TokenHeader({ token }: { token: Token }) {
  const up = token.priceChange24h >= 0;
  const s = deriveStats(token);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-ink-600 p-3">
      <div className="flex items-center gap-3">
        {token.logoURI ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={token.logoURI} alt="" className="h-10 w-10 rounded-full bg-ink-600 object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
        ) : (
          <span className="h-10 w-10 rounded-full bg-ink-600" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-bold text-bone">{token.symbol}</h1>
            <div className="flex items-center gap-0.5 text-muted">
              {ICONS.map((ic) => (
                <button key={ic.title} title={ic.title} className="rounded p-1 hover:bg-ink-700 hover:text-bone">
                  <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${ic.stroke ? "fill-none stroke-current" : "fill-current"}`} strokeWidth="2">
                    <path d={ic.path} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
              <button title="Star" className="rounded p-1 hover:bg-ink-700 hover:text-gold">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
                  <path d="M12 3l2.9 6 6.1.8-4.5 4.3 1.2 6.1L12 17.8 6.3 20.2l1.2-6.1L3 9.8 9.1 9z" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{token.name}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(token.address)}
              className="led text-xs text-muted hover:text-chad"
              title="Copy mint"
            >
              {shortAddr(token.address, 4)} ⧉
            </button>
          </div>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
        <Stat label="Market cap" value={fmtUsd(token.marketCap, { compact: true })} />
        <Stat label="Price" value={fmtUsd(token.price)} />
        <Stat label="24H change" value={fmtPct(token.priceChange24h)} tone={up ? "up" : "down"} />
        <Stat label="24H Vol" value={fmtUsd(token.volume24h, { compact: true })} />
        <Stat label="Liquidity" value={fmtUsd(token.liquidity, { compact: true })} />
        <Stat label="Holders" value={fmtNum(s.holders)} />
        <Stat label="Top 10" value={`${s.top10.toFixed(2)}%`} />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  const color = tone === "up" ? "text-mint" : tone === "down" ? "text-ember" : "text-bone";
  return (
    <div className="border-l border-ink-600 pl-5 first:border-0 first:pl-0">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className={`led text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
