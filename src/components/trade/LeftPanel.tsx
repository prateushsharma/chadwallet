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
    <div className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-bg-tertiary pb-2">
      {/* nav */}
      <div className="flex shrink-0 items-center rounded-t-xl bg-bg-secondary p-2 pl-3">
        <div className="relative min-w-0 flex-1">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto overflow-y-hidden text-sm font-medium">
            {TABS.map((t, i) => (
              <React.Fragment key={t}>
                <button
                  onClick={() => setTab(t)}
                  className={`flex-none whitespace-nowrap text-left hover:text-text-primary ${
                    tab === t ? "text-text-primary" : "text-text-secondary"
                  } ${t === "Alerts" ? "flex items-center justify-start gap-1" : ""}`}
                >
                  {t === "Alerts" && (
                    <span className="relative flex shrink-0 items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" className="fill-current">
                        <path d="M12 2a6 6 0 00-6 6c0 3.6-1 5.3-1.8 6.2-.4.4-.6.6-.6 1 0 .6.5 1 1.2 1h14.4c.7 0 1.2-.4 1.2-1 0-.4-.2-.6-.6-1C18 13.3 18 11.6 18 8a6 6 0 00-6-6zm0 20a3 3 0 002.8-2H9.2a3 3 0 002.8 2z" />
                      </svg>
                      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border border-bg-secondary bg-red" />
                    </span>
                  )}
                  <span>{t}</span>
                </button>
                {i < TABS.length - 1 && <div className="h-4 w-px bg-bg-tertiary/40" />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button className="p-1 text-text-tertiary hover:text-text-primary" aria-label="Collapse discovery panel">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
              <path d="M7.25609 11.911C7.58193 12.2369 7.58193 12.7636 7.25609 13.0894C7.09359 13.2519 6.88023 13.3336 6.6669 13.3336C6.45357 13.3336 6.24021 13.2519 6.07771 13.0894L0.244375 7.25609C-0.0814583 6.93026 -0.0814583 6.40354 0.244375 6.07771L6.07771 0.244375C6.40354 -0.0814583 6.93026 -0.0814583 7.25609 0.244375C7.58193 0.570208 7.58193 1.09693 7.25609 1.42276L2.01195 6.6669L7.25609 11.911ZM7.84529 6.6669L13.0894 1.42276C13.4153 1.09693 13.4153 0.570208 13.0894 0.244375C12.7636 -0.0814583 12.2369 -0.0814583 11.911 0.244375L6.07771 6.07771C5.75187 6.40354 5.75187 6.93026 6.07771 7.25609L11.911 13.0894C12.0735 13.2519 12.2869 13.3336 12.5002 13.3336C12.7136 13.3336 12.9269 13.2519 13.0894 13.0894C13.4153 12.7636 13.4153 12.2369 13.0894 11.911L7.84529 6.6669Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {tab === "Tokens" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* filter chips */}
          <div className="relative shrink-0">
            <div className="no-scrollbar flex cursor-grab gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap px-3 pb-1 pt-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChip(c)}
                  className={`inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-bg-tertiary-solid px-1.5 text-xs font-bold leading-none hover:bg-bg-tertiary-solid ${
                    chip === c ? "bg-bg-tertiary-solid" : "text-text-secondary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg-primary to-transparent" />
          </div>
          <TrendingList tokens={tokens} selected={selected} onSelect={onSelect} />
        </div>
      ) : tab === "Feed" ? (
        <Feed token={token} feed={feed} />
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-text-tertiary">
          {tab === "Alerts" ? "No alerts yet." : "Leaderboard coming soon."}
        </div>
      )}

      {/* split buttons */}
      <div className="mx-2 mt-1 flex items-center gap-2">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-bg-tertiary bg-bg-secondary py-1 text-xs text-text-tertiary hover:text-text-primary hover:opacity-80">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /></svg>
          <span>Split bottom</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-bg-tertiary bg-bg-secondary py-1 text-xs text-text-tertiary hover:text-text-primary hover:opacity-80">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="7" height="18" rx="1.5" /><rect x="13" y="3" width="7" height="18" rx="1.5" /></svg>
          <span>Split right</span>
        </button>
      </div>
    </div>
  );
}

function Feed({ token, feed }: { token: Token; feed: FeedItem[] }) {
  const trader = useTrader();
  return (
    <div className="scroll-thin flex-1 overflow-y-auto">
      <div className="border-b border-bg-tertiary/60 px-3 pb-3 pt-2">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-green/25 text-[10px] font-bold text-green">C</span>
          <span className="font-bold text-text-primary">ChadWallet</span>
          <span className="text-green">✓</span>
          <span className="ml-auto text-text-secondary">13m · 📌 Pinned</span>
        </div>
        <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
          <p className="text-sm font-bold text-text-primary">Recap</p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            High-cap Solana tokens are back in the spotlight, fueled by rising
            on-chain volume and fresh memecoin rotations across the board …
          </p>
          <button className="mt-1 text-xs font-bold text-accent-primary">Show more</button>
        </div>
      </div>

      {feed.map((f) => (
        <div
          key={f.id}
          onClick={() => f.kind === "trade" && trader.open(holderFromName(f.user, token, f.amountUsd), token)}
          className="cursor-pointer border-b border-bg-tertiary/40 px-3 py-2.5 hover:bg-bg-secondary"
        >
          <div className="flex items-center gap-2 text-xs">
            {f.kind === "group" ? (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-bg-tertiary text-[10px]">👥</span>
            ) : (
              <span className="h-6 w-6 rounded-full" style={{ background: `hsl(${f.hue} 60% 45%)` }} />
            )}
            <span className="font-bold text-text-primary">
              {f.kind === "group" ? `${f.groupCount} traders` : f.user}
            </span>
            {f.kind === "group" ? (
              <span className="text-text-secondary">bought {fmtUsd(f.amountUsd, { compact: true })}</span>
            ) : (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  f.side === "buy" ? "bg-green/15 text-green" : "bg-red/15 text-red"
                }`}
              >
                {f.side === "buy" ? "Buy" : "Sell"}
              </span>
            )}
            <span className="ml-auto text-text-secondary">{f.age}</span>
          </div>

          <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-bg-secondary px-2 py-1.5">
            {f.tokenLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.tokenLogo} alt="" className="h-6 w-6 rounded-full bg-bg-tertiary object-cover" />
            ) : (
              <span className="h-6 w-6 rounded-full bg-bg-tertiary" />
            )}
            <span className="text-sm font-bold text-text-primary">{f.tokenSym}</span>
            {f.kind === "group" && f.changePct != null ? (
              <span className="ml-auto text-xs text-green">▲ {f.changePct.toFixed(0)}% in 1h</span>
            ) : (
              <span className="ml-auto text-xs text-text-secondary">
                {fmtUsd(f.amountUsd, { compact: true })} at {fmtUsd(f.mc, { compact: true })} MC
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
