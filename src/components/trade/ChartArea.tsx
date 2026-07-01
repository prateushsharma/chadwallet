"use client";

import React, { useEffect, useState } from "react";
import { Token } from "@/lib/types";
import { fmtUsd } from "@/lib/format";
import { PriceChart, OHLC } from "./PriceChart";

const TF = ["1m", "5m", "15m", "1H", "4H", "1D"];

export function ChartArea({ token }: { token: Token }) {
  const [tf, setTf] = useState("15m");
  const [hover, setHover] = useState<OHLC | null>(null);
  const up = token.priceChange24h >= 0;

  // client-only clock (avoids SSR/CSR hydration mismatch) that also ticks live
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toUTCString().slice(17, 25));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const o = hover?.open, h = hover?.high, l = hover?.low, c = hover?.close;

  return (
    <div className="flex flex-col">
      {/* toolbar */}
      <div className="flex items-center gap-2 border-b border-ink-700 px-3 py-2 text-xs">
        <select
          value={tf}
          onChange={(e) => setTf(e.target.value)}
          className="rounded-md border border-ink-600 bg-ink-800 px-2 py-1 text-bone outline-none"
        >
          {TF.map((x) => <option key={x}>{x}</option>)}
        </select>
        <button className="flex items-center gap-1 rounded-md px-2 py-1 text-muted hover:text-bone"><span className="font-mono">fx</span> Indicators</button>
        <div className="flex items-center rounded-md border border-ink-600">
          <span className="px-2 py-1 text-muted">Price</span>
          <span className="rounded-md bg-chad/15 px-2 py-1 font-bold text-chad">MCap</span>
        </div>
        <span className="ml-auto led text-[11px] text-muted">right-click chart for options</span>
      </div>

      {/* live OHLC legend (updates as you move the crosshair) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 pt-2 text-xs">
        <span className="font-bold text-bone">{token.name}</span>
        <span className="text-muted">· {tf} · ChadWallet</span>
        {o != null ? (
          <span className="led text-muted">
            O<span className={up ? "text-mint" : "text-ember"}>{fmtUsd(o)}</span>{" "}
            H<span className={up ? "text-mint" : "text-ember"}>{fmtUsd(h!)}</span>{" "}
            L<span className={up ? "text-mint" : "text-ember"}>{fmtUsd(l!)}</span>{" "}
            C<span className={up ? "text-mint" : "text-ember"}>{fmtUsd(c!)}</span>
          </span>
        ) : (
          <span className="led text-muted">hover the chart for OHLC</span>
        )}
        <span className={`led ${up ? "text-mint" : "text-ember"}`}>{up ? "+" : ""}{token.priceChange24h.toFixed(2)}%</span>
      </div>

      {/* chart */}
      <div className="px-3 pt-1">
        <PriceChart address={token.address} timeframe={tf} onHover={setHover} onTimeframeChange={setTf} />
      </div>

      {/* timeframe quick row */}
      <div className="flex flex-wrap items-center gap-2 border-t border-ink-700 px-3 py-2 text-xs">
        {TF.map((t) => (
          <button
            key={t}
            onClick={() => setTf(t)}
            className={`rounded px-2 py-0.5 font-medium ${tf === t ? "bg-ink-600 text-bone" : "text-muted hover:text-bone"}`}
          >
            {t}
          </button>
        ))}
        <span className="led ml-auto text-muted">{clock || "--:--:--"} UTC</span>
      </div>

      {/* overlays */}
      <div className="flex flex-wrap items-center gap-4 border-t border-ink-700 px-3 py-2 text-xs">
        <span className="text-muted">Chart overlays</span>
        <Check label="My swaps" />
        <Check label="Thesis" off />
      </div>
    </div>
  );
}

function Check({ label, off }: { label: string; off?: boolean }) {
  const [on, setOn] = useState(!off);
  return (
    <button onClick={() => setOn((v) => !v)} className="flex items-center gap-1.5 text-muted hover:text-bone">
      <span className={`grid h-3.5 w-3.5 place-items-center rounded border ${on ? "border-accent bg-accent text-white" : "border-ink-500"}`}>
        {on && <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-none stroke-current" strokeWidth="4"><path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      {label}
    </button>
  );
}
