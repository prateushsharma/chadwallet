"use client";

import React, { useState } from "react";
import { Token } from "@/lib/types";
import { fmtUsd } from "@/lib/format";
import { PriceChart } from "./PriceChart";

export function ChartArea({ token }: { token: Token }) {
  const [tf, setTf] = useState("1m");
  const [range, setRange] = useState("1D");
  const [overlays, setOverlays] = useState({
    swaps: true,
    thesis: true,
    friends: false,
    minSize: false,
  });

  const mc = token.marketCap;
  const o = mc * 0.95, h = mc * 1.04, l = mc * 0.94, c = mc;
  const chg = c - o;
  const up = token.priceChange24h >= 0;

  return (
    <div className="flex flex-col">
      {/* toolbar */}
      <div className="flex items-center gap-2 border-b border-ink-700 px-3 py-2 text-xs">
        <select
          value={tf}
          onChange={(e) => setTf(e.target.value)}
          className="rounded-md border border-ink-600 bg-ink-800 px-2 py-1 text-bone outline-none"
        >
          {["1s", "1m", "5m", "15m", "1H", "4H", "1D"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <ToolbarIcon title="Candles" path="M4 7h2v10H4zM11 4h2v16h-2zM18 9h2v6h-2z" />
        <button className="flex items-center gap-1 rounded-md px-2 py-1 text-muted hover:text-bone">
          <span className="font-mono">fx</span> Indicators
        </button>
        <div className="flex items-center rounded-md border border-ink-600">
          <span className="px-2 py-1 text-muted">Price</span>
          <span className="rounded-md bg-chad/15 px-2 py-1 font-bold text-chad">MCap</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-muted">
          <ToolbarIcon title="Alerts" path="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
          <ToolbarIcon title="Settings" path="M12 8a4 4 0 100 8 4 4 0 000-8z" />
          <ToolbarIcon title="Fullscreen" path="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke />
          <ToolbarIcon title="Snapshot" path="M4 7h3l2-2h6l2 2h3v12H4z M12 16a3 3 0 100-6 3 3 0 000 6z" />
        </div>
      </div>

      {/* OHLC legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 pt-2 text-xs">
        <span className="font-bold text-bone">{token.name}</span>
        <span className="text-muted">· 1 · ChadWallet</span>
        <span className="led text-muted">
          O<span className={up ? "text-mint" : "text-ember"}>{fmtUsd(o, { compact: true })}</span>{" "}
          H<span className={up ? "text-mint" : "text-ember"}>{fmtUsd(h, { compact: true })}</span>{" "}
          L<span className={up ? "text-mint" : "text-ember"}>{fmtUsd(l, { compact: true })}</span>{" "}
          C<span className={up ? "text-mint" : "text-ember"}>{fmtUsd(c, { compact: true })}</span>
        </span>
        <span className={`led ${up ? "text-mint" : "text-ember"}`}>
          {fmtUsd(Math.abs(chg), { compact: true })} ({up ? "+" : ""}
          {token.priceChange24h.toFixed(2)}%)
        </span>
      </div>

      {/* chart */}
      <div className="px-3 pt-1">
        <PriceChart address={token.address} />
      </div>

      {/* time range + controls */}
      <div className="flex flex-wrap items-center gap-2 border-t border-ink-700 px-3 py-2 text-xs">
        {["1D", "1W", "1M", "3M", "1Y"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded px-2 py-0.5 font-medium ${
              range === r ? "bg-ink-600 text-bone" : "text-muted hover:text-bone"
            }`}
          >
            {r}
          </button>
        ))}
        <div className="led ml-auto flex items-center gap-2 text-muted">
          <span>{new Date().toUTCString().slice(17, 25)} UTC</span>
          <span className="rounded border border-ink-600 px-1.5">%</span>
          <span className="rounded border border-ink-600 px-1.5">log</span>
          <span className="rounded border border-ink-600 bg-ink-700 px-1.5 text-bone">auto</span>
        </div>
      </div>

      {/* overlays */}
      <div className="flex flex-wrap items-center gap-4 border-t border-ink-700 px-3 py-2 text-xs">
        <span className="text-muted">Chart overlays</span>
        <Check label="My swaps" on={overlays.swaps} set={(v) => setOverlays((s) => ({ ...s, swaps: v }))} />
        <Check label="Thesis" on={overlays.thesis} set={(v) => setOverlays((s) => ({ ...s, thesis: v }))} />
        <Check label="Friends only" on={overlays.friends} set={(v) => setOverlays((s) => ({ ...s, friends: v }))} />
        <Check label="Min size (>$1K)" on={overlays.minSize} set={(v) => setOverlays((s) => ({ ...s, minSize: v }))} />
      </div>
    </div>
  );
}

function ToolbarIcon({ title, path, stroke }: { title: string; path: string; stroke?: boolean }) {
  return (
    <button title={title} className="rounded-md p-1.5 text-muted hover:bg-ink-700 hover:text-bone">
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${stroke ? "fill-none stroke-current" : "fill-current"}`} strokeWidth="2">
        <path d={path} />
      </svg>
    </button>
  );
}

function Check({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} className="flex items-center gap-1.5 text-muted hover:text-bone">
      <span
        className={`grid h-3.5 w-3.5 place-items-center rounded border ${
          on ? "border-chad bg-chad text-ink" : "border-ink-500"
        }`}
      >
        {on && (
          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-none stroke-current" strokeWidth="4">
            <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
