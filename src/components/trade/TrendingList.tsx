"use client";

import React, { useMemo, useState } from "react";
import { Token } from "@/lib/types";
import { deriveStats } from "@/lib/derive";
import { fmtUsd, fmtPct, fmtNum } from "@/lib/format";

export function TrendingList({
  tokens,
  selected,
  onSelect,
}: {
  tokens: Token[];
  selected: string;
  onSelect: (t: Token) => void;
}) {
  const [q, setQ] = useState("");
  const [hover, setHover] = useState<{ t: Token; x: number; y: number } | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tokens;
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(s) ||
        t.name.toLowerCase().includes(s) ||
        t.address.toLowerCase().includes(s)
    );
  }, [q, tokens]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-600 p-3">
        <p className="led mb-2 text-xs uppercase tracking-widest text-muted">Trending</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search token or mint…"
          className="w-full rounded-lg border border-ink-500 bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-muted focus:border-chad/50"
        />
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto">
        {filtered.map((t, i) => {
          const up = t.priceChange24h >= 0;
          const active = t.address === selected;
          return (
            <button
              key={t.address}
              onClick={() => onSelect(t)}
              onMouseEnter={(e) => setHover({ t, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
              onMouseLeave={() => setHover(null)}
              className={`flex w-full items-center gap-2.5 border-b border-ink-700 px-3 py-2.5 text-left transition ${
                active ? "bg-chad/10" : "hover:bg-ink-700/50"
              }`}
            >
              <span className="led w-4 shrink-0 text-xs text-muted">{i + 1}</span>
              {t.logoURI ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.logoURI} alt="" className="h-7 w-7 rounded-full bg-ink-600 object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
              ) : (
                <span className="h-7 w-7 rounded-full bg-ink-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-bone">{t.symbol}</p>
                <p className="led truncate text-[11px] text-muted">V {fmtNum(t.volume24h)}</p>
              </div>
              <div className="text-right">
                <p className="led text-xs text-bone">{fmtUsd(t.price)}</p>
                <p className={`led text-[11px] font-bold ${up ? "text-mint" : "text-ember"}`}>{fmtPct(t.priceChange24h)}</p>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="p-4 text-center text-sm text-muted">No matches.</p>}
      </div>

      {hover && <HoverCard token={hover.t} x={hover.x} y={hover.y} />}
    </div>
  );
}

function HoverCard({ token, x, y }: { token: Token; x: number; y: number }) {
  const s = deriveStats(token);
  const up = token.priceChange24h >= 0;
  // keep card on-screen
  const left = Math.min(x + 16, (typeof window !== "undefined" ? window.innerWidth : 1200) - 280);
  const top = Math.min(y + 12, (typeof window !== "undefined" ? window.innerHeight : 800) - 230);
  return (
    <div
      className="pointer-events-none fixed z-50 w-64 rounded-xl border border-ink-500 bg-ink-800/95 p-3 shadow-panel backdrop-blur"
      style={{ left, top }}
    >
      <div className="flex items-center gap-2">
        {token.logoURI ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={token.logoURI} alt="" className="h-9 w-9 rounded-full bg-ink-600 object-cover" />
        ) : (
          <span className="h-9 w-9 rounded-full bg-ink-600" />
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-bone">{token.symbol}</p>
          <p className="truncate text-xs text-muted">{token.name}</p>
        </div>
        <span className={`led ml-auto text-sm font-bold ${up ? "text-mint" : "text-ember"}`}>{fmtPct(token.priceChange24h)}</span>
      </div>
      <p className="led mt-2 text-lg font-bold text-bone">{fmtUsd(token.price)}</p>
      <div className="led mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <Row k="Market cap" v={fmtUsd(token.marketCap, { compact: true })} />
        <Row k="Liquidity" v={fmtUsd(token.liquidity, { compact: true })} />
        <Row k="24h vol" v={fmtUsd(token.volume24h, { compact: true })} />
        <Row k="Holders" v={fmtNum(s.holders)} />
      </div>
      <div className="mt-2 border-t border-ink-600 pt-2">
        <div className="led flex items-center justify-between text-[11px]">
          <span className="text-mint">{fmtNum(s.buys)} buys</span>
          <span className="text-ember">{fmtNum(s.sells)} sells</span>
        </div>
        <div className="mt-1 flex h-1 overflow-hidden rounded-full">
          <span className="bg-mint" style={{ width: `${(s.buys / (s.buys + s.sells)) * 100}%` }} />
          <span className="flex-1 bg-ember" />
        </div>
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
