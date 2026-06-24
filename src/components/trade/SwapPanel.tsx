"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { SOL_MINT } from "@/lib/jupiter";
import { Token } from "@/lib/types";
import { fmtUsd, fmtNum } from "@/lib/format";
import { AuthButton } from "@/components/AuthButton";

interface Position {
  symbol: string;
  address: string;
  amount: number;
  costUsd: number;
}

export function SwapPanel({
  token,
  solPriceUsd,
}: {
  token: Token;
  solPriceUsd: number;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.5");
  const [out, setOut] = useState<number | null>(null);
  const [impact, setImpact] = useState<number>(0);
  const [route, setRoute] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const SOL_DECIMALS = 9;

  useEffect(() => {
    setErr(null);
    setOut(null);
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const inputMint = side === "buy" ? SOL_MINT : token.address;
        const outputMint = side === "buy" ? token.address : SOL_MINT;
        const inDecimals = side === "buy" ? SOL_DECIMALS : token.decimals;
        const base = Math.floor(amt * 10 ** inDecimals);
        const r = await api.quote(inputMint, outputMint, base);
        const outDecimals = side === "buy" ? token.decimals : SOL_DECIMALS;
        setOut(Number(r.quote.outAmount) / 10 ** outDecimals);
        setImpact(Number(r.quote.priceImpactPct) * 100);
        setRoute(r.quote.route ?? []);
      } catch {
        // Jupiter has no route (common for illiquid mock mints) — estimate locally
        if (side === "buy") {
          setOut((amt * solPriceUsd) / token.price);
        } else {
          setOut((amt * token.price) / solPriceUsd);
        }
        setImpact(0);
        setRoute(["estimate"]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => debounce.current && clearTimeout(debounce.current);
  }, [amount, side, token.address, token.decimals, token.price, solPriceUsd]);

  const usdValue =
    side === "buy"
      ? (parseFloat(amount) || 0) * solPriceUsd
      : (parseFloat(amount) || 0) * token.price;

  function execute() {
    const amt = parseFloat(amount);
    if (!amt || !out) return;
    // Session simulation — a real build signs + sends via the embedded wallet.
    setPositions((prev) => {
      const existing = prev.find((p) => p.address === token.address);
      if (side === "buy") {
        const addedUsd = amt * solPriceUsd;
        if (existing) {
          return prev.map((p) =>
            p.address === token.address
              ? { ...p, amount: p.amount + out, costUsd: p.costUsd + addedUsd }
              : p
          );
        }
        return [
          ...prev,
          { symbol: token.symbol, address: token.address, amount: out, costUsd: addedUsd },
        ];
      }
      // sell
      if (existing) {
        const remaining = Math.max(0, existing.amount - amt);
        if (remaining <= 0) return prev.filter((p) => p.address !== token.address);
        return prev.map((p) =>
          p.address === token.address
            ? { ...p, amount: remaining, costUsd: p.costUsd * (remaining / existing.amount) }
            : p
        );
      }
      return prev;
    });
  }

  const quick = side === "buy" ? ["0.1", "0.5", "1", "5"] : ["25%", "50%", "100%"];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-ink-600 bg-ink-900 p-1">
        <button
          onClick={() => setSide("buy")}
          className={`rounded-lg py-2 text-sm font-bold transition ${
            side === "buy" ? "bg-mint text-ink" : "text-muted hover:text-bone"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`rounded-lg py-2 text-sm font-bold transition ${
            side === "sell" ? "bg-ember text-ink" : "text-muted hover:text-bone"
          }`}
        >
          Sell
        </button>
      </div>

      <div>
        <label className="led mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>You pay</span>
          <span>{side === "buy" ? "SOL" : token.symbol}</span>
        </label>
        <div className="rounded-xl border border-ink-500 bg-ink-900 px-3 py-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            className="w-full bg-transparent led text-2xl font-bold text-bone outline-none"
          />
          <p className="led mt-1 text-xs text-muted">≈ {fmtUsd(usdValue)}</p>
        </div>
        <div className="mt-2 flex gap-2">
          {quick.map((q) => (
            <button
              key={q}
              onClick={() => {
                if (q.endsWith("%")) {
                  const pos = positions.find((p) => p.address === token.address);
                  const pct = parseFloat(q) / 100;
                  setAmount(((pos?.amount ?? 0) * pct).toString());
                } else {
                  setAmount(q);
                }
              }}
              className="led flex-1 rounded-lg border border-ink-600 bg-ink-800 py-1.5 text-xs text-muted transition hover:border-chad/50 hover:text-bone"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      <div>
        <label className="led mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>You receive</span>
          <span>{side === "buy" ? token.symbol : "SOL"}</span>
        </label>
        <div className="rounded-xl border border-ink-600 bg-ink-800 px-3 py-3">
          <p className="led text-2xl font-bold text-bone">
            {loading ? "…" : out !== null ? fmtNum(out, out < 1000) : "0"}
          </p>
          <div className="led mt-1 flex justify-between text-xs text-muted">
            <span>
              {route.length
                ? route[0] === "estimate"
                  ? "Local estimate"
                  : `via ${route.slice(0, 2).join(" → ")}`
                : ""}
            </span>
            {impact > 0 && (
              <span className={impact > 3 ? "text-ember" : "text-muted"}>
                {impact.toFixed(2)}% impact
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={execute}
        disabled={!out || loading}
        className={`rounded-xl py-3 font-display text-base font-bold transition disabled:opacity-40 ${
          side === "buy"
            ? "bg-mint text-ink hover:brightness-110"
            : "bg-ember text-ink hover:brightness-110"
        }`}
      >
        {side === "buy" ? `Buy ${token.symbol}` : `Sell ${token.symbol}`}
      </button>

      <div className="rounded-lg border border-ink-600 bg-ink-800/50 p-2.5">
        <p className="led text-[11px] text-muted">
          Quotes are live from Jupiter. Order execution here is a session
          simulation — wire the embedded wallet signer to send for real.
        </p>
      </div>

      <PositionPanel positions={positions} token={token} solPriceUsd={solPriceUsd} />
    </div>
  );
}

function PositionPanel({
  positions,
  token,
  solPriceUsd,
}: {
  positions: Position[];
  token: Token;
  solPriceUsd: number;
}) {
  return (
    <div className="mt-auto border-t border-ink-600 pt-3">
      <p className="led mb-2 text-xs uppercase tracking-widest text-muted">
        Your position
      </p>
      {positions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-500 p-4 text-center">
          <p className="text-sm text-muted">No open positions.</p>
          <div className="mt-2 inline-block">
            <AuthButton compact />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {positions.map((p) => {
            const px = p.address === token.address ? token.price : 0;
            const value = p.amount * px;
            const pnl = value - p.costUsd;
            const pnlPct = p.costUsd ? (pnl / p.costUsd) * 100 : 0;
            const up = pnl >= 0;
            return (
              <div
                key={p.address}
                className="rounded-lg border border-ink-600 bg-ink-800 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-bone">
                    {p.symbol}
                  </span>
                  <span className="led text-sm text-bone">{fmtUsd(value)}</span>
                </div>
                <div className="led mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted">{fmtNum(p.amount)} tokens</span>
                  <span className={up ? "text-mint" : "text-ember"}>
                    {up ? "+" : ""}
                    {fmtUsd(pnl)} ({pnlPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
