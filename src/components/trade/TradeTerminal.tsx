"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Token, TokenOverview } from "@/lib/types";
import { LeftPanel } from "./LeftPanel";
import { ChartArea } from "./ChartArea";
import { TokenHeader } from "./TokenPanels";
import { ActivityTable } from "./ActivityTable";
import { SwapPanel } from "./SwapPanel";
import { TraderProvider } from "./TraderProfile";

// Real seed (SOL) so the very first paint is a real token, not mock — it's
// enriched by BirdEye within ~1s and the list fills from /api/trending.
const SOL_SEED: Token = {
  address: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoURI: undefined,
  price: 0,
  priceChange24h: 0,
  volume24h: 0,
  liquidity: 0,
  marketCap: 0,
};

const OVERVIEW_POLL_MS = 10_000;
const TRENDING_POLL_MS = 45_000;

export function TradeTerminal() {
  const router = useRouter();
  const params = useSearchParams();
  const wanted = params.get("token");

  const [tokens, setTokens] = useState<Token[]>([]);
  const [selected, setSelected] = useState<Token>(
    wanted ? { ...SOL_SEED, address: wanted, symbol: "", name: "" } : SOL_SEED
  );
  const [ov, setOv] = useState<TokenOverview | null>(null);

  // Trending list — initial load + slow refresh (keeps the left column live).
  useEffect(() => {
    let alive = true;
    const load = () =>
      api.trending().then((r) => {
        if (!alive || !r.tokens?.length) return;
        setTokens(r.tokens);
        setSelected((cur) => {
          if (wanted) return r.tokens.find((t) => t.address === wanted) ?? cur;
          return cur.address === SOL_SEED.address && cur.price === 0 ? r.tokens[0] : cur;
        });
      }).catch(() => {});
    load();
    const id = setInterval(load, TRENDING_POLL_MS);
    return () => { alive = false; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selected-token overview — loads on switch and polls so price/stats tick live.
  useEffect(() => {
    let alive = true;
    setOv(null);
    const load = () =>
      api.token(selected.address).then((r) => {
        if (!alive || !r.token?.address) return;
        setOv(r.token);
        setSelected((s) =>
          s.address === r.token.address
            ? {
                ...s,
                symbol: s.symbol || r.token.symbol,
                name: s.name || r.token.name,
                logoURI: s.logoURI || r.token.logoURI,
                decimals: r.token.decimals || s.decimals,
                price: r.token.price || s.price,
                priceChange24h: r.token.priceChange24h ?? s.priceChange24h,
                marketCap: r.token.marketCap || s.marketCap,
                volume24h: r.token.volume24h || s.volume24h,
                liquidity: r.token.liquidity || s.liquidity,
              }
            : s
        );
      }).catch(() => {});
    load();
    const id = setInterval(load, OVERVIEW_POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [selected.address]);

  const solPrice =
    (ov?.symbol === "SOL" ? ov.price : 0) ||
    tokens.find((t) => t.symbol === "SOL")?.price ||
    170;

  function pick(t: Token) {
    setSelected(t);
    router.push(`/trade?token=${t.address}`, { scroll: false });
  }

  return (
    <TraderProvider>
      <div className="grid h-[calc(100vh-92px)] grid-cols-1 lg:grid-cols-[280px_1fr_330px]">
        <aside className="hidden min-h-0 overflow-hidden p-2 lg:block">
          <LeftPanel token={selected} tokens={tokens} selected={selected.address} onSelect={pick} />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-y-auto scroll-thin">
          <TokenHeader token={selected} overview={ov} />
          <ChartArea token={selected} />
          <div className="min-h-[300px] flex-1 border-t border-ink-600">
            <ActivityTable token={selected} />
          </div>
        </section>

        <aside className="min-h-0 overflow-hidden border-l border-ink-600">
          <SwapPanel token={selected} overview={ov} solPriceUsd={solPrice} />
        </aside>
      </div>
    </TraderProvider>
  );
}
