"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { SOL_MINT } from "@/lib/jupiter";
import { Token, TokenOverview } from "@/lib/types";
import { fmtUsd, fmtNum } from "@/lib/format";

const DEMO_BALANCE = 10000;

export function SwapPanel({
  token,
  overview = null,
  solPriceUsd,
}: {
  token: Token;
  overview?: TokenOverview | null;
  solPriceUsd: number;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [usd, setUsd] = useState("");
  const [recv, setRecv] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setRecv(null);
    const amt = parseFloat(usd);
    if (!amt || amt <= 0) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const solIn = amt / solPriceUsd;
        const base = Math.floor(solIn * 1e9);
        const r = await api.quote(SOL_MINT, token.address, base);
        setRecv(Number(r.quote.outAmount) / 10 ** token.decimals);
      } catch {
        setRecv(token.price ? amt / token.price : null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => debounce.current && clearTimeout(debounce.current);
  }, [usd, token.address, token.price, token.decimals, solPriceUsd]);

  function execute() {
    const amt = parseFloat(usd);
    if (!amt || amt <= 0 || !token.price) return;
    setUsd("");
  }

  const sym = token.symbol || "token";
  const quick = ["$10", "$100", "$500", "$1000"];

  return (
    <div className="scroll-thin flex h-full flex-col overflow-y-auto p-4">
      <div className="flex flex-col gap-2 rounded-2xl border border-bg-tertiary p-2">
        {/* toggle */}
        <div className="flex gap-2">
          <button type="button" onClick={() => setSide("buy")}
            className={`flex-1 rounded-lg p-2 text-base font-bold transition-colors ${side === "buy" ? "bg-green-transparent text-green" : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"}`}>
            Buy
          </button>
          <button type="button" onClick={() => setSide("sell")}
            className={`flex-1 rounded-lg p-2 text-base font-bold transition-colors ${side === "sell" ? "bg-red-transparent text-red" : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"}`}>
            Sell
          </button>
        </div>

        {/* amount */}
        <div className="relative flex cursor-text items-stretch gap-px rounded-xl border border-transparent bg-bg-secondary text-3xl focus-within:border-bg-tertiary">
          <div className="flex min-w-0 flex-1 items-center gap-px p-4 pr-0">
            <div className="text-text-tertiary">$</div>
            <input value={usd} onChange={(e) => setUsd(e.target.value)} placeholder="0" inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-tertiary" />
          </div>
          <div className="relative flex shrink-0 cursor-pointer flex-col items-end justify-center p-4 pl-6">
            <div className="text-sm font-medium text-text-tertiary">
              {usd ? (loading ? "…" : recv !== null ? `≈ ${fmtNum(recv, recv < 1000)} ${sym}` : "USD") : "Enter amount"}
            </div>
          </div>
        </div>

        {/* quick + settings */}
        <div className="flex gap-1">
          <div className="grid flex-1 grid-cols-4 gap-2">
            {quick.map((q) => (
              <button key={q} type="button" onClick={() => setUsd(q.replace("$", ""))}
                className="hover-scrim h-8 rounded-lg bg-bg-secondary px-3 text-sm font-bold text-text-primary" translate="no">
                {q}
              </button>
            ))}
          </div>
          <button type="button" title="Settings"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:text-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings" aria-hidden="true">
              <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        {/* available */}
        <div className="flex flex-col px-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary"><span translate="no">{fmtUsd(DEMO_BALANCE)} available</span></div>
          </div>
        </div>

        {/* action */}
        <button type="button" onClick={execute} disabled={!usd || loading || !token.price}
          className={`h-11 overflow-hidden rounded-xl px-4 py-2 text-base font-bold ${
            !usd || loading || !token.price
              ? "cursor-not-allowed border border-bg-tertiary/60 bg-bg-secondary text-text-secondary"
              : side === "buy"
              ? "bg-green text-bg-primary hover:brightness-110"
              : "bg-red text-bg-primary hover:brightness-110"
          }`}>
          <span key={`${side}-${sym}`} className="inline-block animate-flip-up">{side === "buy" ? `Buy ${sym}` : `Sell ${sym}`}</span>
        </button>

        {/* fee row */}
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <div className="flex items-center gap-2">
            <svg className="size-3 text-accent-primary"><use href="/images/sprite.svg#tag" /></svg>
            <span className="text-xs font-bold text-accent-primary">Lowest fees: 0.05%</span>
          </div>
          <svg className="size-3.5 text-text-tertiary"><use href="/images/sprite.svg#info" /></svg>
        </div>
      </div>
    </div>
  );
}
