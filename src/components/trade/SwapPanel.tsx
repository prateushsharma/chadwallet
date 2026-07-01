"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { SOL_MINT } from "@/lib/jupiter";
import { Token, TokenOverview } from "@/lib/types";
import { statsFor } from "@/lib/derive";
import { fmtUsd, fmtNum, fmtPct, shortAddr, timeAgo } from "@/lib/format";
import { AuthButton } from "@/components/AuthButton";

const DEMO_BALANCE = 10000;

interface Position {
  symbol: string;
  address: string;
  amount: number;
  costUsd: number;
}

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
  const [positions, setPositions] = useState<Position[]>([]);
  const [closed, setClosed] = useState<Position[]>([]);
  const [posTab, setPosTab] = useState<"open" | "closed">("open");
  const [more, setMore] = useState(false);
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

  const s = statsFor(token, overview);
  const buyPct = s.buys + s.sells ? (s.buys / (s.buys + s.sells)) * 100 : 50;
  const volPct = s.buyVol + s.sellVol ? (s.buyVol / (s.buyVol + s.sellVol)) * 100 : 50;
  const buyerPct = s.buyers + s.sellers ? (s.buyers / (s.buyers + s.sellers)) * 100 : 50;
  const sym = token.symbol || "token";
  const quick = ["$10", "$100", "$500", "$1000"];

  return (
    <div className="scroll-thin flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Buy / Sell card — fomo structure */}
      <div className="flex flex-col gap-2 rounded-2xl border border-ink-600 p-2">
        {/* toggle */}
        <div className="flex gap-2">
          <button type="button" onClick={() => setSide("buy")}
            className={`flex-1 rounded-lg p-2 text-base font-bold transition-colors ${side === "buy" ? "bg-mint/15 text-mint" : "bg-ink-800 text-muted hover:bg-ink-700"}`}>
            Buy
          </button>
          <button type="button" onClick={() => setSide("sell")}
            className={`flex-1 rounded-lg p-2 text-base font-bold transition-colors ${side === "sell" ? "bg-ember/15 text-ember" : "bg-ink-800 text-muted hover:bg-ink-700"}`}>
            Sell
          </button>
        </div>

        {/* amount */}
        <div className="relative flex cursor-text items-stretch gap-px rounded-xl border border-transparent bg-ink-800 text-3xl focus-within:border-ink-600">
          <div className="flex min-w-0 flex-1 items-center gap-px p-4 pr-0">
            <div className="text-muted">$</div>
            <input value={usd} onChange={(e) => setUsd(e.target.value)} placeholder="0" inputMode="decimal"
              className="led min-w-0 flex-1 bg-transparent font-bold text-bone outline-none placeholder:text-muted" />
          </div>
          <div className="relative flex shrink-0 flex-col items-end justify-center p-4 pl-6">
            <div className="text-sm font-medium text-muted">
              {usd ? (loading ? "…" : recv !== null ? `≈ ${fmtNum(recv, recv < 1000)} ${sym}` : "USD") : "Enter amount"}
            </div>
          </div>
        </div>

        {/* quick amounts + settings */}
        <div className="flex gap-1">
          <div className="grid flex-1 grid-cols-4 gap-2">
            {quick.map((q) => (
              <button key={q} type="button" onClick={() => setUsd(q.replace("$", ""))}
                className="led h-8 rounded-lg bg-ink-800 px-3 text-sm font-bold text-bone hover:brightness-125">
                {q}
              </button>
            ))}
          </div>
          <button type="button" title="Slippage settings"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:text-bone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        {/* available */}
        <div className="flex flex-col px-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="text-muted"><span className="led">{fmtUsd(DEMO_BALANCE)} available</span></div>
          </div>
        </div>

        {/* buy button */}
        <button type="button" onClick={execute} disabled={!usd || loading || !token.price}
          className={`h-11 overflow-hidden rounded-xl px-4 py-2 text-base font-bold transition-colors ${
            !usd || loading || !token.price
              ? "cursor-not-allowed border border-ink-600/60 bg-ink-800 text-muted"
              : side === "buy"
              ? "bg-mint text-ink hover:brightness-110"
              : "bg-ember text-ink hover:brightness-110"
          }`}>
          <span className="inline-block">{side === "buy" ? `Buy ${sym}` : `Sell ${sym}`}</span>
        </button>

        {/* fee row — tag + info */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-accent" strokeWidth="2">
              <path d="M20.59 13.41L13.42 20.6a2 2 0 01-2.83 0L3 13V3h10l7.59 7.59a2 2 0 010 2.82z" strokeLinejoin="round" />
              <circle cx="7.5" cy="7.5" r="1.4" className="fill-accent stroke-none" />
            </svg>
            <span className="text-xs font-bold text-accent">Lowest fees: 0.05%</span>
          </div>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-muted" strokeWidth="2">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* About */}
      <div className="relative mb-6 rounded-xl border border-ink-600 p-2 pb-4">
        <div className="flex flex-col gap-1 px-1">
          <span className="font-medium text-bone">About {sym}</span>
          {s.description ? (
            <div className="flex items-baseline gap-1">
              <p className={`min-w-0 flex-1 text-xs leading-tight text-muted ${more ? "" : "truncate"}`}>{s.description}</p>
              <button onClick={() => setMore((v) => !v)} className="shrink-0 text-xs font-bold text-muted hover:text-bone">
                {more ? "Read less" : "Read more"}
              </button>
            </div>
          ) : (
            <p className="text-xs leading-tight text-muted">{token.name} on Solana.</p>
          )}
        </div>

        {/* 5M / 1H / 4H / 1D */}
        <div className="mt-3 flex gap-1.5">
          <Change label="5M" v={s.ch5m} live={s.live} />
          <Change label="1H" v={s.ch1h} live={s.live} />
          <Change label="4H" v={s.ch4h} live={s.live} />
          <Change label="1D" v={s.ch1d} live={s.live} />
        </div>

        {/* split bars */}
        <div className="mt-3 flex flex-col gap-3 px-1">
          <SplitBar l={`${fmtNum(s.buys)}`} lWord="buys" r={`${fmtNum(s.sells)}`} rWord="sells" pct={buyPct} />
          <SplitBar l={fmtUsd(s.buyVol, { compact: true })} lWord="vol." r={fmtUsd(s.sellVol, { compact: true })} rWord="vol." pct={volPct} />
          <SplitBar l={`${fmtNum(s.buyers)}`} lWord="buyers" r={`${fmtNum(s.sellers)}`} rWord="sellers" pct={buyerPct} />
        </div>

        {/* expandable details */}
        <div className={`grid px-1 transition-[grid-template-rows] duration-200 ease-out ${more ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2 pt-3">
              <div className="flex flex-wrap gap-2">
                {s.website && <LinkChip href={s.website} label="Website" />}
                {s.twitter && <LinkChip href={s.twitter} label="Twitter" />}
                {s.telegram && <LinkChip href={s.telegram} label="Telegram" />}
              </div>
              <Row label="Supply" value={s.supply ? fmtNum(s.supply) : "—"} />
              <Row label="Network" value="Solana" />
              <Row label="Created" value={s.createdAtMs ? `${timeAgo(s.createdAtMs)} ago` : "—"} />
              <Row label="Contract address" value={`${shortAddr(token.address, 4)} ⧉`} onClick={() => navigator.clipboard?.writeText(token.address)} />
            </div>
          </div>
        </div>

        <button onClick={() => setMore((v) => !v)}
          className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 translate-y-1/2 items-center gap-1 rounded-md bg-ink-700 px-2 py-1 text-xs font-bold text-muted hover:text-bone">
          {more ? "View less" : "View more"}
        </button>
      </div>

      {/* Positions */}
      <div className="mt-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-base text-bone">Your positions</p>
          <div className="flex gap-1 rounded-lg border border-ink-600 p-0.5 text-xs">
            <button onClick={() => setPosTab("open")}
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 font-bold ${posTab === "open" ? "bg-accent/15 text-accent" : "text-muted"}`}>
              Open
              {posTab === "open" && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
              )}
            </button>
            <button onClick={() => setPosTab("closed")}
              className={`rounded-md px-1.5 py-0.5 font-bold ${posTab === "closed" ? "bg-ink-600 text-bone" : "text-muted"}`}>
              Closed
            </button>
          </div>
        </div>
        <PositionList positions={posTab === "open" ? positions : closed} token={token} />
      </div>
    </div>
  );
}

function Change({ label, v, live }: { label: string; v: number; live: boolean }) {
  const up = v >= 0;
  return (
    <div className="flex flex-1 flex-col items-center rounded-md border border-ink-600 py-1.5 hover:bg-ink-800">
      <span className="text-xs text-muted">{label}</span>
      <span className={`led text-xs font-medium ${up ? "text-mint" : "text-ember"}`}>{live ? fmtPct(v) : "—"}</span>
    </div>
  );
}

function SplitBar({ l, lWord, r, rWord, pct }: { l: string; lWord: string; r: string; rWord: string; pct: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span><span className="led font-medium text-bone">{l}</span> <span className="text-muted">{lWord}</span></span>
        <span><span className="led font-medium text-bone">{r}</span> <span className="text-muted">{rWord}</span></span>
      </div>
      <div className="flex h-1.5 gap-1">
        <span className="rounded-[1.5px] bg-mint transition-[width] duration-150" style={{ width: `${pct}%` }} />
        <span className="flex-1 rounded-[1.5px] bg-ember" />
      </div>
    </div>
  );
}

function LinkChip({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1 rounded-lg border border-ink-600 bg-ink-800 px-2 py-1 text-xs font-medium hover:opacity-80">
      {label}
    </a>
  );
}

function Row({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="shrink-0 whitespace-nowrap text-xs text-muted">{label}</span>
      <span className="min-w-4 flex-1 -translate-y-px border-b border-dashed border-ink-600" />
      <button onClick={onClick} className={`led shrink-0 whitespace-nowrap text-xs font-medium text-bone ${onClick ? "hover:opacity-70" : "cursor-default"}`}>
        {value}
      </button>
    </div>
  );
}

function PositionList({ positions, token }: { positions: Position[]; token: Token }) {
  if (positions.length === 0)
    return (
      <div className="flex min-h-[60px] items-center justify-center text-sm text-muted">No open positions</div>
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
      <div className="pt-1"><AuthButton compact /></div>
    </div>
  );
}
