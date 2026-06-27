"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Holder, Token, Trade } from "@/lib/types";
import { deriveStats } from "@/lib/derive";
import { fmtUsd, fmtPct, fmtNum, shortAddr, timeAgo } from "@/lib/format";

export function TokenHeader({ token }: { token: Token }) {
  const up = token.priceChange24h >= 0;
  const s = deriveStats(token);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-ink-600 p-4">
      <div className="flex items-center gap-3">
        {token.logoURI ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={token.logoURI}
            alt=""
            className="h-10 w-10 rounded-full bg-ink-600 object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
          />
        ) : (
          <span className="h-10 w-10 rounded-full bg-ink-600" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-bold text-bone">{token.symbol}</h1>
            <span className="text-sm text-muted">{token.name}</span>
          </div>
          <a
            href={`https://solscan.io/token/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="led text-xs text-muted hover:text-chad"
          >
            {shortAddr(token.address, 5)} ↗
          </a>
        </div>
      </div>

      {/* fomo-style stat strip */}
      <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
        <Stat label="Market cap" value={fmtUsd(token.marketCap, { compact: true })} />
        <Stat label="Price" value={fmtUsd(token.price)} />
        <Stat label="24H change" value={fmtPct(token.priceChange24h)} tone={up ? "up" : "down"} />
        <Stat label="24H Vol" value={fmtUsd(token.volume24h, { compact: true })} />
        <Stat label="Liquidity" value={fmtUsd(token.liquidity, { compact: true })} />
        <Stat label="Holders" value={fmtNum(s.holders)} />
        <Stat label="Top 10" value={`${s.top10.toFixed(2)}%`} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  const color = tone === "up" ? "text-mint" : tone === "down" ? "text-ember" : "text-bone";
  return (
    <div className="border-l border-ink-600 pl-5 first:border-0 first:pl-0">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className={`led text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function ActivityPanel({ token }: { token: Token }) {
  const [tab, setTab] = useState<"trades" | "holders">("trades");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [holders, setHolders] = useState<Holder[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () => {
      api.trades(token.address).then((r) => alive && setTrades(r.trades)).catch(() => {});
      api.holders(token.address).then((r) => alive && setHolders(r.holders)).catch(() => {});
    };
    load();
    const id = setInterval(() => {
      api.trades(token.address).then((r) => alive && setTrades(r.trades)).catch(() => {});
    }, 6000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [token.address]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-ink-600">
        <TabButton active={tab === "trades"} onClick={() => setTab("trades")}>Swaps</TabButton>
        <TabButton active={tab === "holders"} onClick={() => setTab("holders")}>Holders</TabButton>
      </div>

      {tab === "trades" ? (
        <div className="scroll-thin flex-1 overflow-y-auto">
          <div className="led sticky top-0 grid grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b border-ink-700 bg-ink-800 px-4 py-2 text-[10px] uppercase tracking-wide text-muted">
            <span>Type</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Value</span>
            <span className="text-right">Age</span>
          </div>
          {trades.map((t) => (
            <div key={t.id} className="led grid grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b border-ink-700/60 px-4 py-1.5 text-xs">
              <span className={`font-bold ${t.side === "buy" ? "text-mint" : "text-ember"}`}>
                {t.side === "buy" ? "BUY" : "SELL"}
              </span>
              <span className="text-right text-bone">{fmtNum(t.amountToken)}</span>
              <span className="text-right text-bone">{fmtUsd(t.amountUsd)}</span>
              <span className="text-right text-muted">{timeAgo(t.time)}</span>
            </div>
          ))}
          {!trades.length && <p className="p-4 text-center text-sm text-muted">No recent swaps.</p>}
        </div>
      ) : (
        <div className="scroll-thin flex-1 overflow-y-auto">
          <div className="led sticky top-0 grid grid-cols-[auto_1fr_auto] gap-2 border-b border-ink-700 bg-ink-800 px-4 py-2 text-[10px] uppercase tracking-wide text-muted">
            <span>#</span>
            <span>Trader</span>
            <span className="text-right">Holding</span>
          </div>
          {holders.map((h) => (
            <div key={h.owner + h.rank} className="led grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-ink-700/60 px-4 py-1.5 text-xs">
              <span className="text-muted">{h.rank}</span>
              <a href={`https://solscan.io/account/${h.owner}`} target="_blank" rel="noopener noreferrer" className="text-bone hover:text-chad">
                {shortAddr(h.owner, 5)}
              </a>
              <div className="flex items-center justify-end gap-2">
                <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-ink-600 sm:block">
                  <span className="block h-full bg-chad" style={{ width: `${Math.min(100, h.percentage)}%` }} />
                </span>
                <span className="w-12 text-right text-bone">{h.percentage.toFixed(2)}%</span>
              </div>
            </div>
          ))}
          {!holders.length && <p className="p-4 text-center text-sm text-muted">No holder data.</p>}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2.5 text-sm font-medium transition ${active ? "border-b-2 border-chad text-bone" : "text-muted hover:text-bone"}`}>
      {children}
    </button>
  );
}
