"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fmtUsd, fmtPct } from "@/lib/format";

interface Row {
  sym: string;
  price: number;
  ch: number;
}

export function BottomBar() {
  const [rows, setRows] = useState<Row[]>([
    { sym: "BTC", price: 60460.74, ch: 1.51 },
    { sym: "ETH", price: 1590.07, ch: 1.92 },
    { sym: "SOL", price: 168.42, ch: 4.31 },
    { sym: "USDC", price: 1.0, ch: 0.0 },
  ]);

  // Pull live SOL from our API; gently jitter the rest so the bar feels live.
  useEffect(() => {
    let alive = true;
    api
      .token("So11111111111111111111111111111111111111112")
      .then((r) => {
        if (!alive || !r.token) return;
        setRows((prev) =>
          prev.map((x) =>
            x.sym === "SOL"
              ? { ...x, price: r.token.price, ch: r.token.priceChange24h }
              : x
          )
        );
      })
      .catch(() => {});
    const id = setInterval(() => {
      setRows((prev) =>
        prev.map((x) =>
          x.sym === "USDC"
            ? x
            : { ...x, price: x.price * (1 + (Math.random() - 0.5) * 0.0008) }
        )
      );
    }, 4000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="sticky bottom-0 z-30 flex items-center justify-between border-t border-ink-600 bg-ink-900/90 px-4 py-1.5 backdrop-blur">
      <div className="scroll-thin flex items-center gap-5 overflow-x-auto">
        {rows.map((r) => (
          <span key={r.sym} className="led flex shrink-0 items-center gap-1.5 text-xs">
            <span className="font-bold text-bone">{fmtUsd(r.price)}</span>
            <span className={r.ch >= 0 ? "text-mint" : "text-ember"}>
              {r.ch >= 0 ? "▲" : "▼"} {fmtPct(r.ch).replace("+", "")}
            </span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="led flex items-center gap-1.5 text-xs text-mint">
          <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Stable
        </span>
        <span className="hidden gap-3 text-xs text-muted sm:flex">
          <a href="#" className="hover:text-bone">Privacy</a>
          <a href="#" className="hover:text-bone">Terms</a>
          <a href="#" className="hover:text-bone">Help</a>
        </span>
      </div>
    </div>
  );
}
