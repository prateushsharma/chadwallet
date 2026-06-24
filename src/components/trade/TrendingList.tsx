"use client";

import React, { useMemo, useState } from "react";
import { Token } from "@/lib/types";
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
        <p className="led mb-2 text-xs uppercase tracking-widest text-muted">
          Trending
        </p>
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
              className={`flex w-full items-center gap-2.5 border-b border-ink-700 px-3 py-2.5 text-left transition ${
                active ? "bg-chad/10" : "hover:bg-ink-700/50"
              }`}
            >
              <span className="led w-4 shrink-0 text-xs text-muted">
                {i + 1}
              </span>
              {t.logoURI ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.logoURI}
                  alt=""
                  className="h-7 w-7 rounded-full bg-ink-600 object-cover"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.visibility = "hidden")
                  }
                />
              ) : (
                <span className="h-7 w-7 rounded-full bg-ink-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-bone">
                  {t.symbol}
                </p>
                <p className="led truncate text-[11px] text-muted">
                  V {fmtNum(t.volume24h)}
                </p>
              </div>
              <div className="text-right">
                <p className="led text-xs text-bone">{fmtUsd(t.price)}</p>
                <p
                  className={`led text-[11px] font-bold ${up ? "text-mint" : "text-ember"}`}
                >
                  {fmtPct(t.priceChange24h)}
                </p>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-muted">No matches.</p>
        )}
      </div>
    </div>
  );
}
