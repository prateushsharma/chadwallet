"use client";

import React, { useState } from "react";
import { Token } from "@/lib/types";
import { FeedItem, genFeed, holderFromName } from "@/lib/feed";
import { useTrader } from "./TraderProfile";
import { fmtUsd } from "@/lib/format";
import { TrendingList } from "./TrendingList";

const TABS = ["Alerts", "Tokens", "Leaderboard", "Feed"] as const;
type Tab = (typeof TABS)[number];
const CHIPS = ["Watchlist", "Crypto", "Trending", "Most held", "Graduated", "Bonding"] as const;

export function LeftPanel({
  token,
  tokens,
  selected,
  onSelect,
}: {
  token: Token;
  tokens: Token[];
  selected: string;
  onSelect: (t: Token) => void;
}) {
  const [tab, setTab] = useState<Tab>("Tokens");
  const [chip, setChip] = useState<string>("Trending");
  const feed = genFeed(token);

  return (
    <div className="flex h-full flex-col">
      {/* tabs */}
      <div className="flex items-center gap-3 border-b border-ink-600 bg-ink-800/60 px-3 py-2.5 text-sm">
        {TABS.map((t) => (
          <React.Fragment key={t}>
            <button
              onClick={() => setTab(t)}
              className={`flex items-center gap-1 whitespace-nowrap font-medium transition ${
                tab === t ? "text-bone" : "text-muted hover:text-bone"
              }`}
            >
              {t === "Alerts" && (
                <span className="relative">
                  🔔
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-ember" />
                </span>
              )}
              {t}
            </button>
            {t !== "Feed" && <span className="h-4 w-px bg-ink-600/50" />}
          </React.Fragment>
        ))}
      </div>

      {tab === "Tokens" ? (
        <>
          {/* filter chips */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-1 pt-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setChip(c)}
                className={`inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-md border px-1.5 text-xs font-bold ${
                  chip === c
                    ? "border-ink-500 bg-ink-600 text-bone"
                    : "border-ink-600 text-muted hover:text-bone"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <TrendingList tokens={tokens} selected={selected} onSelect={onSelect} />
        </>
      ) : tab === "Feed" ? (
        <Feed token={token} feed={feed} />
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted">
          {tab === "Alerts" ? "No alerts yet." : "Leaderboard coming soon."}
        </div>
      )}

      {/* split buttons */}
      <div className="mx-2 mt-1 flex items-center gap-2 pb-2">
        <button className="led flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 py-1 text-xs text-muted hover:text-bone">
          ⬓ Split bottom
        </button>
        <button className="led flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 py-1 text-xs text-muted hover:text-bone">
          ⬔ Split right
        </button>
      </div>
    </div>
  );
}

function Feed({ token, feed }: { token: Token; feed: FeedItem[] }) {
  const trader = useTrader();
  return (
    <div className="scroll-thin flex-1 overflow-y-auto">
      {/* pinned recap */}
      <div className="border-b border-ink-700 px-3 pb-3 pt-2">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-chad/30 text-[10px] font-bold text-chad">C</span>
          <span className="font-bold text-bone">ChadWallet</span>
          <span className="text-chad">✓</span>
          <span className="ml-auto text-muted">13m · 📌 Pinned</span>
        </div>
        <div className="rounded-lg border border-ink-600 bg-ink-800 p-3">
          <p className="text-sm font-bold text-bone">Recap</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            High-cap Solana tokens are back in the spotlight, fueled by rising
            on-chain volume and fresh memecoin rotations across the board …
          </p>
          <button className="mt-1 text-xs font-bold text-accent">Show more</button>
        </div>
        <div className="mt-2 text-xs text-muted">♡ 3</div>
      </div>

      {feed.map((f) => (
        <div
          key={f.id}
          onClick={() => f.kind === "trade" && trader.open(holderFromName(f.user, token, f.amountUsd), token)}
          className="cursor-pointer border-b border-ink-700/60 px-3 py-2.5 hover:bg-ink-700/40"
        >
          <div className="flex items-center gap-2 text-xs">
            {f.kind === "group" ? (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ink-600 text-[10px]">👥</span>
            ) : (
              <span className="h-6 w-6 rounded-full" style={{ background: `hsl(${f.hue} 60% 45%)` }} />
            )}
            <span className="font-bold text-bone">
              {f.kind === "group" ? `${f.groupCount} traders` : f.user}
            </span>
            {f.kind === "group" ? (
              <span className="text-muted">bought {fmtUsd(f.amountUsd, { compact: true })}</span>
            ) : (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  f.side === "buy" ? "bg-mint/15 text-mint" : "bg-ember/15 text-ember"
                }`}
              >
                {f.side === "buy" ? "Buy" : "Sell"}
              </span>
            )}
            <span className="ml-auto text-muted">{f.age}</span>
          </div>

          <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-ink-800/60 px-2 py-1.5">
            {f.tokenLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.tokenLogo} alt="" className="h-6 w-6 rounded-full bg-ink-600 object-cover" />
            ) : (
              <span className="h-6 w-6 rounded-full bg-ink-600" />
            )}
            <span className="text-sm font-bold text-bone">{f.tokenSym}</span>
            {f.kind === "group" && f.changePct != null ? (
              <span className="led ml-auto text-xs text-mint">▲ {f.changePct.toFixed(0)}% in 1h</span>
            ) : (
              <span className="led ml-auto text-xs text-muted">
                {fmtUsd(f.amountUsd, { compact: true })} at {fmtUsd(f.mc, { compact: true })} MC
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
