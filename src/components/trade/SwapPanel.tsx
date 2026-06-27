"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { SOL_MINT } from "@/lib/jupiter";
import { Token } from "@/lib/types";
import { deriveStats } from "@/lib/derive";
import { fmtUsd, fmtNum, fmtPct } from "@/lib/format";
import { AuthButton } from "@/components/AuthButton";

const DEMO_BALANCE = 10000; // paper-trading balance for the simulation

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
  const [usd, setUsd] = useState("");
  const [recv, setRecv] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [posTab, setPosTab] = useState<"open" | "closed">("open");
  const [closed, setClosed] = useState<Position[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  // Live Jupiter estimate for the entered USD amount.
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
        setRecv(amt / token.price); // local estimate fallback
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => debounce.current && clearTimeout(debounce.current);
  }, [usd, token.address, token.price, token.decimals, solPriceUsd]);

  function execute() {
    const amt = parseFloat(usd);
    if (!amt || amt <= 0) return;
    const tokens = recv ?? amt / token.price;
    setPositions((prev) => {
      const existing = prev.find((p) => p.address === token.address);
      if (side === "buy") {
        if (existing)
          return prev.map((p) =>
            p.address === token.address
              ? { ...p, amount: p.amount + tokens, costUsd: p.costUsd + amt }
              : p
          );
        return [...prev, { symbol: token.symbol, address: token.address, amount: tokens, costUsd: amt }];
      }
      // sell: reduce by USD worth
      if (!existing) return prev;
      const sellTokens = Math.min(existing.amount, amt / token.price);
      const remaining = existing.amount - sellTokens;
      if (remaining <= 0.000001) {
        setClosed((c) => [...c, existing]);
        return prev.filter((p) => p.address !== token.address);
      }
      return prev.map((p) =>
        p.address === token.address
          ? { ...p, amount: remaining, costUsd: p.costUsd * (remaining / existing.amount) }
          : p
      );
    });
    setUsd("");
  }

  const quick = ["$10", "$100", "$500", "$1000"];
  const stats = deriveStats(token);
  const buyPct = (stats.buys / (stats.buys + stats.sells)) * 100;
  const volPct = (stats.buyVol / (stats.buyVol + stats.sellVol)) * 100;
  const buyerPct = (stats.buyers / (stats.buyers + stats.sellers)) * 100;

  return (
    <div className="scroll-thin flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-ink-600 bg-ink-900 p-1">
        <button
          onClick={() => setSide("buy")}
          className={`rounded-lg py-2.5 text-sm font-bold transition ${side === "buy" ? "bg-mint text-ink" : "text-muted hover:text-bone"}`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`rounded-lg py-2.5 text-sm font-bold transition ${side === "sell" ? "bg-ember text-ink" : "text-muted hover:text-bone"}`}
        >
          Sell
        </button>
      </div>

      {/* Amount input */}
      <div className="rounded-xl border border-ink-500 bg-ink-900 px-4 py-3">
        <div className="flex items-baseline justify-between">
          <input
            type="number"
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
            placeholder="$0"
            min="0"
            step="any"
            className="led w-full bg-transparent text-3xl font-bold text-bone outline-none placeholder:text-muted"
          />
          <span className="led shrink-0 text-xs text-muted">{usd ? "USD" : "Enter amount"}</span>
        </div>
        {usd && (
          <p className="led mt-1 text-xs text-muted">
            {loading ? "…" : recv !== null ? `≈ ${fmtNum(recv, recv < 1000)} ${token.symbol}` : ""}
          </p>
        )}
      </div>

      {/* quick amounts */}
      <div className="flex gap-2">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => setUsd(q.replace("$", ""))}
            className="led flex-1 rounded-lg border border-ink-600 bg-ink-800 py-2 text-xs text-muted transition hover:border-chad/50 hover:text-bone"
          >
            {q}
          </button>
        ))}
      </div>

      <p className="led text-xs text-muted">{fmtUsd(DEMO_BALANCE)} available · demo</p>

      <button
        onClick={execute}
        disabled={!usd || loading}
        className={`rounded-xl py-3.5 font-display text-base font-bold transition disabled:opacity-40 ${side === "buy" ? "bg-mint text-ink hover:brightness-110" : "bg-ember text-ink hover:brightness-110"}`}
      >
        {side === "buy" ? `Buy ${token.symbol}` : `Sell ${token.symbol}`}
      </button>

      <p className="led text-[11px] text-gold">⚠ Unverified token · trade carefully</p>

      {/* About */}
      <div className="border-t border-ink-600 pt-4">
        <p className="font-display text-sm font-bold text-bone">About {token.symbol}</p>
        <p className="mt-0.5 text-xs text-muted">{token.name} on Solana</p>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <Change label="5M" v={stats.ch5m} />
          <Change label="1H" v={stats.ch1h} />
          <Change label="4H" v={stats.ch4h} />
          <Change label="1D" v={stats.ch1d} />
        </div>

        <div className="mt-4 space-y-3">
          <SplitBar leftLabel={`${fmtNum(stats.buys)} buys`} rightLabel={`${fmtNum(stats.sells)} sells`} leftPct={buyPct} />
          <SplitBar leftLabel={`${fmtUsd(stats.buyVol, { compact: true })} vol`} rightLabel={`${fmtUsd(stats.sellVol, { compact: true })} vol`} leftPct={volPct} />
          <SplitBar leftLabel={`${fmtNum(stats.buyers)} buyers`} rightLabel={`${fmtNum(stats.sellers)} sellers`} leftPct={buyerPct} />
        </div>
      </div>

      {/* Positions */}
      <div className="mt-2 border-t border-ink-600 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="led text-xs uppercase tracking-widest text-muted">Your positions</p>
          <div className="flex gap-1 rounded-lg border border-ink-600 p-0.5 text-xs">
            <button onClick={() => setPosTab("open")} className={`rounded px-2 py-0.5 ${posTab === "open" ? "bg-ink-600 text-bone" : "text-muted"}`}>Open</button>
            <button onClick={() => setPosTab("closed")} className={`rounded px-2 py-0.5 ${posTab === "closed" ? "bg-ink-600 text-bone" : "text-muted"}`}>Closed</button>
          </div>
        </div>
        <PositionList positions={posTab === "open" ? positions : closed} token={token} />
      </div>
    </div>
  );
}

function Change({ label, v }: { label: string; v: number }) {
  const up = v >= 0;
  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800 px-1.5 py-1.5 text-center">
      <p className="text-[10px] text-muted">{label}</p>
      <p className={`led text-xs font-bold ${up ? "text-mint" : "text-ember"}`}>{fmtPct(v)}</p>
    </div>
  );
}

function SplitBar({ leftLabel, rightLabel, leftPct }: { leftLabel: string; rightLabel: string; leftPct: number }) {
  return (
    <div>
      <div className="led mb-1 flex justify-between text-xs">
        <span className="text-mint">{leftLabel}</span>
        <span className="text-ember">{rightLabel}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full">
        <span className="block bg-mint" style={{ width: `${leftPct}%` }} />
        <span className="block flex-1 bg-ember" />
      </div>
    </div>
  );
}

function PositionList({ positions, token }: { positions: Position[]; token: Token }) {
  if (positions.length === 0)
    return (
      <div className="rounded-lg border border-dashed border-ink-500 p-4 text-center">
        <p className="text-sm text-muted">No open positions.</p>
        <div className="mt-2 inline-block"><AuthButton compact /></div>
      </div>
    );
  return (
    <div className="space-y-2">
      {positions.map((p) => {
        const px = p.address === token.address ? token.price : 0;
        const value = p.amount * px;
        const pnl = value - p.costUsd;
        const pct = p.costUsd ? (pnl / p.costUsd) * 100 : 0;
        const up = pnl >= 0;
        return (
          <div key={p.address} className="rounded-lg border border-ink-600 bg-ink-800 p-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold text-bone">{p.symbol}</span>
              <span className="led text-sm text-bone">{fmtUsd(value)}</span>
            </div>
            <div className="led mt-1 flex items-center justify-between text-xs">
              <span className="text-muted">{fmtNum(p.amount)} tokens</span>
              <span className={up ? "text-mint" : "text-ember"}>{up ? "+" : ""}{fmtUsd(pnl)} ({pct.toFixed(1)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
