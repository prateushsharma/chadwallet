"use client";

import React, { createContext, useContext, useState } from "react";
import { Token } from "@/lib/types";
import { RichHolder, genTraderTxs } from "@/lib/feed";
import { fmtUsd, fmtNum, fmtPct, timeAgo } from "@/lib/format";

interface Ctx {
  open: (holder: RichHolder, token: Token) => void;
}
const TraderCtx = createContext<Ctx>({ open: () => {} });
export const useTrader = () => useContext(TraderCtx);

export function TraderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ holder: RichHolder; token: Token } | null>(null);
  return (
    <TraderCtx.Provider value={{ open: (holder, token) => setState({ holder, token }) }}>
      {children}
      {state && <TraderModal holder={state.holder} token={state.token} onClose={() => setState(null)} />}
    </TraderCtx.Provider>
  );
}

function TraderModal({ holder, token, onClose }: { holder: RichHolder; token: Token; onClose: () => void }) {
  const txs = genTraderTxs(holder.name + holder.rank, token);
  const up = holder.pnlUsd >= 0;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-24" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-ink-500 bg-ink-800 shadow-panel" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center gap-3 border-b border-ink-600 p-4">
          <span className="h-11 w-11 rounded-full" style={{ background: `hsl(${holder.hue} 60% 45%)` }} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold text-bone">{holder.name}</p>
            <p className="led text-xs text-muted">⊙ {holder.holdTime} avg. hold</p>
          </div>
          <button className="rounded-lg bg-mint px-4 py-1.5 text-sm font-bold text-ink hover:brightness-110">Follow</button>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-ink-700 hover:text-bone">✕</button>
        </div>

        {/* position on this token */}
        <div className="border-b border-ink-600 p-4">
          <div className="flex items-center gap-2">
            {token.logoURI ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={token.logoURI} alt="" className="h-6 w-6 rounded-full bg-ink-600 object-cover" />
            ) : <span className="h-6 w-6 rounded-full bg-ink-600" />}
            <span className="font-display text-sm font-bold text-bone">{token.symbol}</span>
            <span className={`led ml-auto text-sm font-bold ${up ? "text-mint" : "text-ember"}`}>{up ? "+" : ""}{fmtUsd(holder.pnlUsd)} ({fmtPct(holder.pnlPct)})</span>
          </div>
          <div className="led mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Cell k="Position" v={fmtUsd(holder.positionUsd)} />
            <Cell k="Holding" v={`${fmtNum(holder.tokenAmount)} ${token.symbol}`} />
            <Cell k="Avg. entry" v={`${fmtUsd(holder.avgEntryMc, { compact: true })} MC`} />
            <Cell k="Invested" v={fmtUsd(holder.positionUsd - holder.pnlUsd)} />
          </div>
        </div>

        {/* thesis */}
        {holder.thesis && (
          <div className="border-b border-ink-600 p-4">
            <p className="led text-[11px] uppercase tracking-wide text-muted">Thesis · ♡ {holder.thesisLikes}</p>
            <p className="mt-1 text-sm text-bone">{holder.thesis}</p>
          </div>
        )}

        {/* transactions */}
        <div className="max-h-56 overflow-y-auto scroll-thin">
          <p className="led sticky top-0 bg-ink-800 px-4 py-2 text-[11px] uppercase tracking-wide text-muted">Transactions ({txs.length})</p>
          {txs.map((t, i) => (
            <div key={i} className="led flex items-center justify-between border-b border-ink-700/60 px-4 py-2 text-xs">
              <span className={`font-bold ${t.side === "buy" ? "text-mint" : "text-ember"}`}>{t.side === "buy" ? "Buy" : "Sell"}</span>
              <span className="text-bone">{fmtUsd(t.amountUsd)} at {fmtUsd(t.mc, { compact: true })} MC</span>
              <span className="text-muted">{timeAgo(t.time)}</span>
            </div>
          ))}
        </div>

        <p className="px-4 py-2 text-[10px] text-muted">PnL, entry &amp; tx history are estimated — per-wallet history needs a paid data tier.</p>
      </div>
    </div>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted">{k}</p>
      <p className="font-bold text-bone">{v}</p>
    </div>
  );
}
