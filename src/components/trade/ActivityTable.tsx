"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Token, Trade, Holder } from "@/lib/types";
import { fmtUsd, fmtNum, timeAgo, shortAddr } from "@/lib/format";

/* fomo's bottom table — Holders + Swaps — transcribed from fomo's own markup
   (container-query grid, sticky Trader column, edge fades, -my-2 hover bleed,
   32px avatars, gap-6/py-2 rhythm) on REAL BirdEye data. Thesis dropped, and the
   PnL / Avg. entry columns fomo computes from its account backend are omitted —
   we render only columns BirdEye truly provides. */

type TabKey = "holders" | "swaps";

const HOLDERS_POLL_MS = 30_000;
const SWAPS_POLL_MS = 12_000;

function hueOf(addr: string): number {
  let h = 0;
  for (let i = 0; i < addr.length; i++) h = (h * 31 + addr.charCodeAt(i)) % 360;
  return h;
}

export function ActivityTable({ token }: { token: Token }) {
  const [tab, setTab] = useState<TabKey>("holders");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(false);
  const loaded = useRef<{ holders?: string; trades?: string }>({});

  useEffect(() => {
    loaded.current = {};
    setHolders([]);
    setTrades([]);
  }, [token.address]);

  useEffect(() => {
    let alive = true;
    const loadHolders = async () => {
      try {
        const r = await api.holders(token.address);
        if (alive && r.holders) { setHolders(r.holders); loaded.current.holders = token.address; }
      } catch {/* keep last-good */}
    };
    const loadTrades = async () => {
      try {
        const r = await api.trades(token.address);
        if (alive && r.trades) { setTrades(r.trades); loaded.current.trades = token.address; }
      } catch {/* keep last-good */}
    };
    const first = tab === "holders" ? loaded.current.holders !== token.address
                                    : loaded.current.trades !== token.address;
    if (first) setLoading(true);
    const run = tab === "holders" ? loadHolders : loadTrades;
    run().finally(() => { if (alive) setLoading(false); });
    const id = setInterval(run, tab === "holders" ? HOLDERS_POLL_MS : SWAPS_POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [tab, token.address]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col rounded-lg border border-bg-tertiary">
      {/* tabs — fomo's bg-secondary rounded-t header */}
      <div className="flex h-10 shrink-0 items-center justify-between rounded-t-lg bg-bg-secondary px-2 pl-3">
        <div className="flex gap-3 text-sm">
          <button onClick={() => setTab("holders")}
            className={`capitalize focus:outline-none ${tab === "holders" ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}>holders</button>
          <div className="flex items-center gap-3">
            <div className="h-4 w-px bg-bg-tertiary/40" />
            <button onClick={() => setTab("swaps")}
              className={`capitalize focus:outline-none ${tab === "swaps" ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}>swaps</button>
          </div>
        </div>
        {loading && <span className="pr-1 text-xs text-green">syncing…</span>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {tab === "holders"
          ? <Holders holders={holders} token={token} loading={loading} />
          : <Swaps trades={trades} loading={loading} />}
      </div>
    </div>
  );
}

/* ---------- Holders (real: address, position, % supply) ---------- */
function Holders({ holders, token, loading }: { holders: Holder[]; token: Token; loading: boolean }) {
  return (
    <div className="@container flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* right edge fade — fomo */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-4 bg-linear-to-l from-bg-primary/80 to-transparent" />
        <div className="flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-auto scrollbar-none overscroll-x-none">
          {/* header */}
          <div className="sticky top-0 z-[5] grid min-w-full grid-cols-[minmax(0,1fr)_9rem] items-center gap-6 border-b border-bg-tertiary/60 bg-bg-primary py-1.5 text-xs text-text-tertiary @[400px]:w-max @[400px]:grid-cols-[12rem_9rem_6.5rem] @[900px]:w-auto @[900px]:grid-cols-[minmax(0,240px)_minmax(0,1fr)_6.5rem]">
            <div className="sticky left-0 z-[1] -my-1.5 flex self-stretch items-center border-r border-transparent bg-bg-primary pl-3 pr-4 @[900px]:static @[900px]:border-r-0">Trader</div>
            <div>Position</div>
            <div className="hidden pr-3 text-right @[400px]:block">% Supply</div>
          </div>

          {holders.map((h) => {
            const positionUsd = h.amount * token.price;
            return (
              <button key={h.rank + h.owner}
                className="group grid min-w-full grid-cols-[1fr_auto] items-center gap-6 py-2 hover:bg-bg-secondary @[400px]:w-max @[400px]:grid-cols-[12rem_9rem_6.5rem] @[900px]:w-auto @[900px]:grid-cols-[minmax(0,240px)_minmax(0,1fr)_6.5rem]">
                {/* Trader (sticky left) */}
                <div className="sticky left-0 z-[1] -my-2 flex items-center gap-3 overflow-hidden border-r border-transparent bg-bg-primary py-2 pl-3 pr-4 transition-[border-color] group-hover:bg-bg-secondary @[900px]:static @[900px]:border-r-0">
                  <div className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: `hsl(${hueOf(h.owner)} 62% 52%)` }} />
                  <div className="flex min-w-0 flex-col items-start gap-0.5">
                    <div className="w-full truncate text-left text-sm leading-5" translate="no">{shortAddr(h.owner, 4)}</div>
                    <div className="text-xs leading-4 text-text-secondary">#{h.rank} holder</div>
                  </div>
                </div>
                {/* Position */}
                <div className="flex flex-col items-start gap-0.5 tabular-nums" translate="no">
                  <div className="text-sm leading-5">{fmtUsd(positionUsd)}</div>
                  <div className="text-xs leading-4 text-text-secondary">{fmtNum(h.amount)} {token.symbol}</div>
                </div>
                {/* % supply */}
                <div className="hidden pr-3 text-right text-sm tabular-nums @[400px]:block" translate="no">{h.percentage.toFixed(2)}%</div>
              </button>
            );
          })}

          {!holders.length && (
            <div className="p-6 text-center text-sm text-text-tertiary">{loading ? "Loading holders…" : "No holder data."}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Swaps (100% real BirdEye) ---------- */
function Swaps({ trades, loading }: { trades: Trade[]; loading: boolean }) {
  return (
    <div className="@container flex min-w-0 min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto scrollbar-none">
        <div className="sticky top-0 z-10 hidden gap-3 border-b border-bg-tertiary/60 bg-bg-primary px-3 py-1.5 text-xs text-text-tertiary @[500px]:grid @[500px]:grid-cols-[1fr_4rem_7rem_6rem_3rem] @[500px]:items-center">
          <div>Trader</div><div>Action</div><div>Amount</div><div>Price</div><div className="text-right">Time</div>
        </div>
        {trades.map((t) => {
          const buy = t.side === "buy";
          const c = buy ? "rgb(33, 201, 94)" : "rgb(255, 98, 46)";
          const bg = buy ? "rgba(33, 201, 94, 0.2)" : "rgba(255, 98, 46, 0.2)";
          return (
            <button key={t.id}
              className="grid min-w-0 grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 px-3 py-2 hover:bg-bg-secondary @[500px]:grid-cols-[1fr_4rem_7rem_6rem_3rem]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-6 w-6 shrink-0 rounded-full" style={{ backgroundColor: `hsl(${hueOf(t.wallet)} 62% 52%)` }} />
                <div className="min-w-0 truncate text-left text-sm font-medium" translate="no">{shortAddr(t.wallet, 4)}</div>
              </div>
              <div className="flex w-fit items-center gap-1 rounded-sm px-1 py-px text-xs font-bold" style={{ color: c, backgroundColor: bg }}>{buy ? "Buy" : "Sell"}</div>
              <div className="text-left text-sm tabular-nums" translate="no">{fmtUsd(t.amountUsd)}</div>
              <div className="text-left text-sm tabular-nums" translate="no">{fmtUsd(t.priceUsd)}</div>
              <div className="text-right text-xs text-text-tertiary" translate="no">{timeAgo(t.time)}</div>
            </button>
          );
        })}
        {!trades.length && (
          <div className="p-6 text-center text-sm text-text-tertiary">{loading ? "Loading swaps…" : "No recent swaps."}</div>
        )}
      </div>
    </div>
  );
}
