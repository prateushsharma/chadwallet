#!/usr/bin/env bash
set -euo pipefail

# ChadWallet — rebuild the bottom table (Holders + Swaps) from fomo's markup on REAL BirdEye data.
#  - Thesis tab/column dropped (per-wallet thesis/PnL/avg-entry/hold-time are fomo's own account
#    backend, not any market API — so we render only what BirdEye actually returns).
#  - Holders: Trader (address) | Position ($ + tokens) | % Supply — all real.
#  - Swaps: Trader | Action pill | Amount | Price | Time — 100% real BirdEye, live-polled.
#  Adds fomo's .scrollbar-none utility. Idempotent; safe to re-run.
# Run from repo root:  bash apply_fomo_holders_swaps.sh

if [ ! -f package.json ] || [ ! -d .git ]; then echo "ERROR: run from the chadwallet repo root."; exit 1; fi
grep -q '"chadwallet-web"' package.json || { echo "ERROR: not the chadwallet repo."; exit 1; }
if ! grep -q "statsFor" src/lib/derive.ts 2>/dev/null; then echo "NOTE: run apply_terminal_realdata.sh first (this uses the live-data layer)."; exit 1; fi

if ! grep -q '\.scrollbar-none' src/app/globals.css; then
cat >> src/app/globals.css << 'CHADFOMO_EOF'

/* fomo's scrollbar-none — hide the scrollbar entirely */
.scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
CHADFOMO_EOF
echo "· globals.css: scrollbar-none added"
else
echo "· globals.css: scrollbar-none already present"
fi

mkdir -p src/components/trade
cat > src/components/trade/ActivityTable.tsx << 'CHADFOMO_EOF'
"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Token, Trade, Holder } from "@/lib/types";
import { fmtUsd, fmtNum, timeAgo, shortAddr } from "@/lib/format";

/* fomo's bottom table — Holders + Swaps, on real BirdEye data.
   Thesis is intentionally dropped: per-wallet thesis/PnL/avg-entry/hold-time come from
   fomo's own account backend, not any market API, so we only render what BirdEye truly returns.
   Markup mirrors fomo's: rounded-lg border card, bg-secondary tab header, sticky grid header,
   colored Buy/Sell pills with fomo's literal rgb() values. */

type TabKey = "holders" | "swaps";

const HOLDERS_POLL_MS = 30_000;
const SWAPS_POLL_MS = 12_000;

// deterministic avatar hue from a wallet address (BirdEye has no profile pics)
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

  // reset when the token changes
  useEffect(() => {
    loaded.current = {};
    setHolders([]);
    setTrades([]);
  }, [token.address]);

  // fetch + live-poll only the active tab
  useEffect(() => {
    let alive = true;
    const loadHolders = async () => {
      try {
        const r = await api.holders(token.address);
        if (alive && r.holders) {
          setHolders(r.holders);
          loaded.current.holders = token.address;
        }
      } catch {/* keep last-good */}
    };
    const loadTrades = async () => {
      try {
        const r = await api.trades(token.address);
        if (alive && r.trades) {
          setTrades(r.trades);
          loaded.current.trades = token.address;
        }
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
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-bg-tertiary">
      {/* tab header — fomo's bg-secondary rounded-t row */}
      <div className="flex h-10 shrink-0 items-center justify-between rounded-t-lg bg-bg-secondary px-2 pl-3">
        <div className="flex gap-3 text-sm">
          <button
            onClick={() => setTab("holders")}
            className={`capitalize focus:outline-none ${tab === "holders" ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}
          >holders</button>
          <div className="flex items-center gap-3">
            <div className="h-4 w-px bg-bg-tertiary/40" />
            <button
              onClick={() => setTab("swaps")}
              className={`capitalize focus:outline-none ${tab === "swaps" ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}
            >swaps</button>
          </div>
        </div>
        <div className="flex items-center gap-3 pr-1 text-xs text-text-tertiary">
          {loading && <span className="text-green">syncing…</span>}
        </div>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1 flex-col">
        {tab === "holders" ? (
          <Holders holders={holders} token={token} loading={loading} />
        ) : (
          <Swaps trades={trades} loading={loading} />
        )}
      </div>
    </div>
  );
}

/* ---------- Holders (real: address, position, % supply) ---------- */
function Holders({ holders, token, loading }: { holders: Holder[]; token: Token; loading: boolean }) {
  const cols = "grid-cols-[minmax(0,1fr)_9rem_6rem]";
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-none">
      <div className={`sticky top-0 z-[5] grid ${cols} items-center gap-6 border-b border-bg-tertiary/60 bg-bg-primary py-1.5 pl-3 pr-3 text-xs text-text-tertiary`}>
        <div>Trader</div>
        <div>Position</div>
        <div className="text-right">% Supply</div>
      </div>
      {holders.map((h) => {
        const positionUsd = h.amount * token.price;
        return (
          <button
            key={h.rank + h.owner}
            className={`group grid ${cols} items-center gap-6 py-2 pl-3 pr-3 hover:bg-bg-secondary`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `hsl(${hueOf(h.owner)} 62% 52%)` }} />
              <div className="flex min-w-0 flex-col items-start gap-0.5">
                <div className="w-full truncate text-left text-sm leading-5" translate="no">{shortAddr(h.owner, 4)}</div>
                <div className="text-xs leading-4 text-text-secondary">#{h.rank} holder</div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-0.5 tabular-nums" translate="no">
              <div className="text-sm leading-5">{fmtUsd(positionUsd)}</div>
              <div className="text-xs leading-4 text-text-secondary">{fmtNum(h.amount)} {token.symbol}</div>
            </div>
            <div className="text-right text-sm tabular-nums" translate="no">{h.percentage.toFixed(2)}%</div>
          </button>
        );
      })}
      {!holders.length && (
        <div className="p-6 text-center text-sm text-text-tertiary">{loading ? "Loading holders…" : "No holder data."}</div>
      )}
    </div>
  );
}

/* ---------- Swaps (100% real BirdEye) ---------- */
function Swaps({ trades, loading }: { trades: Trade[]; loading: boolean }) {
  const cols = "grid-cols-[minmax(0,1fr)_4rem_7rem_6rem_3rem]";
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-none">
      <div className={`sticky top-0 z-10 grid ${cols} items-center gap-3 border-b border-bg-tertiary/60 bg-bg-primary px-3 py-1.5 text-xs text-text-tertiary`}>
        <div>Trader</div>
        <div>Action</div>
        <div>Amount</div>
        <div>Price</div>
        <div className="text-right">Time</div>
      </div>
      {trades.map((t) => {
        const buy = t.side === "buy";
        const c = buy ? "rgb(33, 201, 94)" : "rgb(255, 98, 46)";
        const bg = buy ? "rgba(33, 201, 94, 0.2)" : "rgba(255, 98, 46, 0.2)";
        return (
          <button key={t.id} className={`grid ${cols} min-w-0 items-center gap-3 px-3 py-2 hover:bg-bg-secondary`}>
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-6 w-6 shrink-0 rounded-full" style={{ backgroundColor: `hsl(${hueOf(t.wallet)} 62% 52%)` }} />
              <div className="min-w-0 truncate text-left text-sm font-medium" translate="no">{shortAddr(t.wallet, 4)}</div>
            </div>
            <div className="flex w-fit items-center gap-1 rounded-sm px-1 py-px text-xs font-bold" style={{ color: c, backgroundColor: bg }}>
              {buy ? "Buy" : "Sell"}
            </div>
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
  );
}
CHADFOMO_EOF

git add -- src/app/globals.css src/components/trade/ActivityTable.tsx
if git diff --cached --quiet; then
  echo "· no changes to commit"
else
  git commit -q -m "feat(trade): fomo Holders/Swaps table on real BirdEye data (drop Thesis)"
  echo "· commit ok"
fi
rm -rf .next
echo
echo "Applied. Restart:  pkill -f 'next dev'; rm -rf .next; npm run dev   then hard-refresh /trade."
