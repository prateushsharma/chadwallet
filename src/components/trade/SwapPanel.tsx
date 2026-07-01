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
  overview,
  solPriceUsd,
}: {
  token: Token;
  overview: TokenOverview | null;
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
      {/* Buy / Sell */}
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-ink-600 bg-ink-900 p-1">
        <button onClick={() => setSide("buy")}
          className={`rounded-lg py-2.5 text-sm font-bold transition ${side === "buy" ? "bg-mint/15 text-mint" : "text-muted hover:text-bone"}`}>
          Buy
        </button>
        <button onClick={() => setSide("sell")}
          className={`rounded-lg py-2.5 text-sm font-bold transition ${side === "sell" ? "bg-ember/15 text-ember" : "text-muted hover:text-bone"}`}>
          Sell
        </button>
      </div>

      {/* Amount */}
      <div className="flex items-stretch rounded-xl border border-transparent bg-ink-900 focus-within:border-ink-600">
        <div className="flex flex-1 items-center gap-1 p-4 pr-0">
          <span className="text-3xl text-muted">$</span>
          <input type="number" value={usd} onChange={(e) => setUsd(e.target.value)} placeholder="0" min="0" step="any"
            className="led w-full min-w-0 bg-transparent text-3xl font-bold text-bone outline-none placeholder:text-muted" />
        </div>
        <div className="flex shrink-0 flex-col items-end justify-center p-4">
          <span className="led text-xs text-muted">
            {usd ? (loading ? "…" : recv !== null ? `≈ ${fmtNum(recv, recv < 1000)} ${sym}` : "USD") : "Enter amount"}
          </span>
        </div>
      </div>

      {/* quick + settings */}
      <div className="flex gap-1">
        <div className="grid flex-1 grid-cols-4 gap-2">
          {quick.map((q) => (
            <button key={q} onClick={() => setUsd(q.replace("$", ""))}
              className="led h-8 rounded-lg bg-ink-800 px-3 text-sm font-bold text-bone hover:brightness-125">
              {q}
            </button>
          ))}
        </div>
        <button className="grid h-8 w-8 shrink-0 place-items-center text-muted hover:text-bone" title="Slippage settings">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
            <circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <p className="led px-2 text-xs text-muted">{fmtUsd(DEMO_BALANCE)} available</p>

      <button onClick={execute} disabled={!usd || loading || !token.price}
        className={`rounded-xl py-3 font-display text-base font-bold transition disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-muted ${side === "buy" ? "bg-mint text-ink hover:brightness-110" : "bg-ember text-ink hover:brightness-110"}`}>
        {side === "buy" ? `Buy ${sym}` : `Sell ${sym}`}
      </button>

      <div className="flex items-center justify-between px-2">
        <span className="flex items-center gap-1 text-xs font-bold text-accent">◈ Lowest fees: 0.05%</span>
        <span className="text-xs text-muted">ⓘ</span>
      </div>

      {/* About */}
      <div className="rounded-xl border border-ink-600 p-2 pb-3">
        <div className="flex flex-col gap-1 px-1">
          <span className="font-medium text-bone">About {sym}</span>
          {s.description ? (
            <p className={`text-xs leading-tight text-muted ${more ? "" : "line-clamp-2"}`}>{s.description}</p>
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

        <div className="mt-2 flex justify-center">
          <button onClick={() => setMore((v) => !v)}
            className="rounded-md bg-ink-700 px-2 py-1 text-xs font-bold text-muted hover:text-bone">
            {more ? "View less" : "View more"}
          </button>
        </div>
      </div>

      {/* Positions */}
      <div className="mt-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-base text-bone">Your positions</p>
          <div className="flex gap-1 rounded-lg border border-ink-600 p-0.5 text-xs">
            <button onClick={() => setPosTab("open")}
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 font-bold ${posTab === "open" ? "bg-accent/15 text-accent" : "text-muted"}`}>
              Open
              {posTab === "open" && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
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
