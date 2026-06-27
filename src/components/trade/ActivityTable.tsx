"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Token, Trade } from "@/lib/types";
import { genRichHolders, RichHolder } from "@/lib/feed";
import { fmtUsd, fmtNum, fmtPct, timeAgo } from "@/lib/format";

export function ActivityTable({ token }: { token: Token }) {
  const [tab, setTab] = useState<"holders" | "swaps" | "thesis">("holders");
  const [trades, setTrades] = useState<Trade[]>([]);
  const holders = genRichHolders(token);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api.trades(token.address).then((r) => alive && setTrades(r.trades)).catch(() => {});
    load();
    const id = setInterval(load, 6000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [token.address]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-ink-600 px-1">
        <Tab on={tab === "holders"} onClick={() => setTab("holders")}>Holders</Tab>
        <Tab on={tab === "swaps"} onClick={() => setTab("swaps")}>Swaps</Tab>
        <Tab on={tab === "thesis"} onClick={() => setTab("thesis")}>Thesis ({holders.length * 20 + 9})</Tab>
        <div className="ml-auto flex gap-4 pr-3 text-xs text-muted">
          <span>☐ Thesis only</span>
          <span>☐ Friends only</span>
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto">
        {tab === "holders" && <Holders holders={holders} />}
        {tab === "swaps" && <Swaps trades={trades} />}
        {tab === "thesis" && <ThesisList holders={holders} />}
      </div>
    </div>
  );
}

function Holders({ holders }: { holders: RichHolder[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="led sticky top-0 bg-ink-800 text-[10px] uppercase tracking-wide text-muted">
        <tr>
          <th className="px-4 py-2 text-left font-medium">Trader</th>
          <th className="px-4 py-2 text-left font-medium">Position</th>
          <th className="px-4 py-2 text-left font-medium">PnL</th>
          <th className="px-4 py-2 text-left font-medium">Avg. entry</th>
          <th className="px-4 py-2 text-left font-medium">Thesis</th>
        </tr>
      </thead>
      <tbody>
        {holders.map((h) => {
          const up = h.pnlUsd >= 0;
          return (
            <tr key={h.rank} className="border-b border-ink-700/60 align-top">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 shrink-0 rounded-full" style={{ background: `hsl(${h.hue} 60% 45%)` }} />
                  <div>
                    <p className="font-bold text-bone">{h.name}</p>
                    <p className="led text-[11px] text-muted">⊙ {h.holdTime} avg. hold</p>
                  </div>
                </div>
              </td>
              <td className="led px-4 py-2.5">
                <p className="text-bone">{fmtUsd(h.positionUsd)}</p>
                <p className="text-[11px] text-muted">{fmtNum(h.tokenAmount)} tokens</p>
              </td>
              <td className="led px-4 py-2.5">
                <p className={up ? "text-mint" : "text-ember"}>{up ? "+" : ""}{fmtUsd(h.pnlUsd)}</p>
                <p className={`text-[11px] ${up ? "text-mint" : "text-ember"}`}>{fmtPct(h.pnlPct)}</p>
              </td>
              <td className="led px-4 py-2.5">
                <p className="text-bone">{fmtUsd(h.avgEntryMc, { compact: true })} MC</p>
                <p className="text-[11px] text-muted">{fmtUsd(h.avgEntryPrice)}</p>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-start gap-2">
                  <span className="led text-[11px] text-muted">♡ {h.thesisLikes}</span>
                  <span className="max-w-[260px] text-xs text-muted">{h.thesis}</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Swaps({ trades }: { trades: Trade[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="led sticky top-0 bg-ink-800 text-[10px] uppercase tracking-wide text-muted">
        <tr>
          <th className="px-4 py-2 text-left font-medium">Type</th>
          <th className="px-4 py-2 text-right font-medium">Amount</th>
          <th className="px-4 py-2 text-right font-medium">Value</th>
          <th className="px-4 py-2 text-right font-medium">Age</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t) => (
          <tr key={t.id} className="led border-b border-ink-700/60 text-xs">
            <td className={`px-4 py-1.5 font-bold ${t.side === "buy" ? "text-mint" : "text-ember"}`}>
              {t.side === "buy" ? "BUY" : "SELL"}
            </td>
            <td className="px-4 py-1.5 text-right text-bone">{fmtNum(t.amountToken)}</td>
            <td className="px-4 py-1.5 text-right text-bone">{fmtUsd(t.amountUsd)}</td>
            <td className="px-4 py-1.5 text-right text-muted">{timeAgo(t.time)}</td>
          </tr>
        ))}
        {!trades.length && (
          <tr><td colSpan={4} className="p-4 text-center text-sm text-muted">No recent swaps.</td></tr>
        )}
      </tbody>
    </table>
  );
}

function ThesisList({ holders }: { holders: RichHolder[] }) {
  return (
    <div className="divide-y divide-ink-700/60">
      {holders.map((h) => (
        <div key={h.rank} className="flex items-start gap-3 px-4 py-3">
          <span className="h-8 w-8 shrink-0 rounded-full" style={{ background: `hsl(${h.hue} 60% 45%)` }} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-bone">{h.name}</span>
              <span className="led text-[11px] text-muted">♡ {h.thesisLikes}</span>
            </div>
            <p className="text-sm text-muted">{h.thesis}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-2.5 text-sm font-medium transition ${on ? "border-b-2 border-chad text-bone" : "text-muted hover:text-bone"}`}>
      {children}
    </button>
  );
}
