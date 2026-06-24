"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Holder, Token, Trade } from "@/lib/types";
import { fmtUsd, fmtPct, fmtNum, shortAddr, timeAgo } from "@/lib/format";

export function TokenHeader({ token }: { token: Token }) {
  const up = token.priceChange24h >= 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-600 p-4">
      <div className="flex items-center gap-3">
        {token.logoURI ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={token.logoURI}
            alt=""
            className="h-11 w-11 rounded-full bg-ink-600 object-cover"
            onError={(e) =>
              ((e.target as HTMLImageElement).style.visibility = "hidden")
            }
          />
        ) : (
          <span className="h-11 w-11 rounded-full bg-ink-600" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-bone">
              {token.symbol}
            </h1>
            <span className="text-sm text-muted">{token.name}</span>
          </div>
          <a
            href={`https://solscan.io/token/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="led text-xs text-muted hover:text-chad"
          >
            {shortAddr(token.address, 6)} ↗
          </a>
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="led text-2xl font-bold text-bone">
          {fmtUsd(token.price)}
        </span>
        <span
          className={`led text-sm font-bold ${up ? "text-mint" : "text-ember"}`}
        >
          {fmtPct(token.priceChange24h)}
        </span>
      </div>

      <div className="flex gap-6">
        <Stat label="Market cap" value={fmtUsd(token.marketCap, { compact: true })} />
        <Stat label="Liquidity" value={fmtUsd(token.liquidity, { compact: true })} />
        <Stat label="24h vol" value={fmtUsd(token.volume24h, { compact: true })} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className="led text-sm font-bold text-bone">{value}</p>
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
        <TabButton active={tab === "trades"} onClick={() => setTab("trades")}>
          Live trades
        </TabButton>
        <TabButton active={tab === "holders"} onClick={() => setTab("holders")}>
          Top holders
        </TabButton>
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
            <div
              key={t.id}
              className="led grid grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b border-ink-700/60 px-4 py-1.5 text-xs"
            >
              <span
                className={`font-bold ${t.side === "buy" ? "text-mint" : "text-ember"}`}
              >
                {t.side === "buy" ? "BUY" : "SELL"}
              </span>
              <span className="text-right text-bone">
                {fmtNum(t.amountToken)}
              </span>
              <span className="text-right text-bone">{fmtUsd(t.amountUsd)}</span>
              <span className="text-right text-muted">{timeAgo(t.time)}</span>
            </div>
          ))}
          {!trades.length && (
            <p className="p-4 text-center text-sm text-muted">No recent trades.</p>
          )}
        </div>
      ) : (
        <div className="scroll-thin flex-1 overflow-y-auto">
          <div className="led sticky top-0 grid grid-cols-[auto_1fr_auto] gap-2 border-b border-ink-700 bg-ink-800 px-4 py-2 text-[10px] uppercase tracking-wide text-muted">
            <span>#</span>
            <span>Wallet</span>
            <span className="text-right">Share</span>
          </div>
          {holders.map((h) => (
            <div
              key={h.owner + h.rank}
              className="led grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-ink-700/60 px-4 py-1.5 text-xs"
            >
              <span className="text-muted">{h.rank}</span>
              <a
                href={`https://solscan.io/account/${h.owner}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bone hover:text-chad"
              >
                {shortAddr(h.owner, 5)}
              </a>
              <div className="flex items-center justify-end gap-2">
                <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-ink-600 sm:block">
                  <span
                    className="block h-full bg-chad"
                    style={{ width: `${Math.min(100, h.percentage)}%` }}
                  />
                </span>
                <span className="w-12 text-right text-bone">
                  {h.percentage.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
          {!holders.length && (
            <p className="p-4 text-center text-sm text-muted">No holder data.</p>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-b-2 border-chad text-bone"
          : "text-muted hover:text-bone"
      }`}
    >
      {children}
    </button>
  );
}
