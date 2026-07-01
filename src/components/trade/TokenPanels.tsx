"use client";

import React from "react";
import { Token, TokenOverview } from "@/lib/types";
import { statsFor } from "@/lib/derive";
import { fmtUsd, fmtPct, fmtNum, shortAddr } from "@/lib/format";

const ICONS: { title: string; path: string }[] = [
  { title: "Website", path: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" },
  { title: "X", path: "M4 4l16 16M20 4L4 20" },
  { title: "Telegram", path: "M21 5L3 12l5 2 2 5 3-4 4 3z" },
  { title: "Search", path: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4-4" },
];

export function TokenHeader({ token, overview }: { token: Token; overview: TokenOverview | null }) {
  const s = statsFor(token, overview);
  const up = s.ch1d >= 0;
  const dash = (v: string) => (s.live ? v : "—");

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-ink-600 p-3">
      {/* identity */}
      <div className="flex items-center gap-3">
        {token.logoURI ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={token.logoURI} alt="" className="h-10 w-10 rounded-full border border-ink-600 bg-ink-700 object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
        ) : (
          <span className="h-10 w-10 rounded-full border border-ink-600 bg-ink-700" />
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-display text-base font-bold text-bone">{token.symbol || "…"}</h1>
            <div className="flex items-center gap-0.5 text-muted">
              {ICONS.map((ic) => (
                <button key={ic.title} title={ic.title} className="grid h-6 w-6 place-items-center rounded-sm bg-ink-700 p-0.5 hover:text-bone">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
                    <path d={ic.path} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
              <button title="Watchlist" className="grid h-6 w-6 place-items-center rounded-sm p-0.5 hover:text-bone">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
                  <path d="M12 3l2.9 6 6.1.8-4.5 4.3 1.2 6.1L12 17.8 6.3 20.2l1.2-6.1L3 9.8 9.1 9z" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="max-w-32 truncate text-xs text-muted">{token.name}</span>
            <span className="h-3 w-px bg-ink-600" />
            <button
              onClick={() => navigator.clipboard?.writeText(token.address)}
              className="led flex items-center gap-1 text-xs text-muted hover:text-accent"
              title="Copy mint"
            >
              {shortAddr(token.address, 4)} ⧉
            </button>
          </div>
        </div>
      </div>

      {/* stat row — fomo order: Price (prominent) then pills */}
      <div className="no-scrollbar ml-auto flex items-center gap-2 overflow-x-auto">
        <div className="flex w-24 shrink-0 flex-col items-center py-1">
          <span className="text-xs text-muted">Price</span>
          <span className="led text-lg font-medium leading-tight text-bone">{fmtUsd(s.price)}</span>
        </div>
        <StatBox label="Market cap" value={fmtUsd(s.marketCap, { compact: true })} />
        <StatBox label="24H change" value={fmtPct(s.ch1d)} tone={up ? "up" : "down"} />
        <StatBox label="24H Vol." value={fmtUsd(s.volume24h, { compact: true })} />
        <StatBox label="Liquidity" value={fmtUsd(s.liquidity, { compact: true })} />
        <StatBox label="Holders" value={dash(s.holders ? fmtNum(s.holders) : "—")} />
        <StatBox label="Top 10 holding" value={s.top10 ? `${s.top10.toFixed(2)}%` : "—"} />
      </div>
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  const color = tone === "up" ? "text-mint" : tone === "down" ? "text-ember" : "text-bone";
  return (
    <div className="flex min-w-[88px] shrink-0 flex-col items-center rounded-lg bg-ink-800 px-2 py-1.5">
      <span className="whitespace-nowrap text-xs text-muted">{label}</span>
      <span className={`led whitespace-nowrap text-sm font-medium ${color}`}>{value}</span>
    </div>
  );
}
