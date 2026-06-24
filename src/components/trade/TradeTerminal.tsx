"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { MOCK_TOKENS } from "@/lib/mock";
import { Token } from "@/lib/types";
import { TrendingList } from "./TrendingList";
import { PriceChart } from "./PriceChart";
import { TokenHeader, ActivityPanel } from "./TokenPanels";
import { SwapPanel } from "./SwapPanel";

export function TradeTerminal() {
  const router = useRouter();
  const params = useSearchParams();
  const wanted = params.get("token");

  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS);
  const [selected, setSelected] = useState<Token>(
    MOCK_TOKENS.find((t) => t.address === wanted) ?? MOCK_TOKENS[0]
  );
  const [mobileTab, setMobileTab] = useState<"chart" | "trade">("chart");

  // Load trending list
  useEffect(() => {
    api
      .trending()
      .then((r) => {
        if (r.tokens?.length) {
          setTokens(r.tokens);
          if (!wanted) setSelected(r.tokens[0]);
          else {
            const hit = r.tokens.find((t) => t.address === wanted);
            if (hit) setSelected(hit);
          }
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When ?token changes (banner clicks), refetch overview
  useEffect(() => {
    if (!wanted) return;
    const known = tokens.find((t) => t.address === wanted);
    if (known) setSelected(known);
    api
      .token(wanted)
      .then((r) => r.token?.address && setSelected(r.token))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted]);

  const solPrice =
    tokens.find((t) => t.symbol === "SOL")?.price ??
    MOCK_TOKENS[0].price ??
    160;

  function pick(t: Token) {
    setSelected(t);
    router.push(`/trade?token=${t.address}`, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-[1600px] px-2 py-3 sm:px-4">
      <div className="grid gap-3 lg:grid-cols-[260px_1fr_320px]">
        {/* Left — trending */}
        <aside className="hidden h-[calc(100vh-180px)] overflow-hidden rounded-xl border border-ink-600 bg-ink-800/60 lg:block">
          <TrendingList
            tokens={tokens}
            selected={selected.address}
            onSelect={pick}
          />
        </aside>

        {/* Middle — chart + activity */}
        <section className="min-w-0 space-y-3">
          <div className="overflow-hidden rounded-xl border border-ink-600 bg-ink-800/60">
            <TokenHeader token={selected} />

            {/* mobile chart/trade switch */}
            <div className="flex border-b border-ink-600 lg:hidden">
              <button
                onClick={() => setMobileTab("chart")}
                className={`flex-1 py-2 text-sm font-medium ${mobileTab === "chart" ? "border-b-2 border-chad text-bone" : "text-muted"}`}
              >
                Chart
              </button>
              <button
                onClick={() => setMobileTab("trade")}
                className={`flex-1 py-2 text-sm font-medium ${mobileTab === "trade" ? "border-b-2 border-chad text-bone" : "text-muted"}`}
              >
                Trade
              </button>
            </div>

            <div className={mobileTab === "trade" ? "hidden lg:block" : "block"}>
              <div className="p-3">
                <PriceChart address={selected.address} />
              </div>
            </div>
          </div>

          <div className="h-[320px] overflow-hidden rounded-xl border border-ink-600 bg-ink-800/60">
            <ActivityPanel token={selected} />
          </div>
        </section>

        {/* Right — swap + position */}
        <aside
          className={`overflow-hidden rounded-xl border border-ink-600 bg-ink-800/60 ${
            mobileTab === "trade" ? "block" : "hidden lg:block"
          }`}
        >
          <SwapPanel token={selected} solPriceUsd={solPrice} />
        </aside>
      </div>

      {/* mobile trending row */}
      <div className="mt-3 lg:hidden">
        <div className="h-[300px] overflow-hidden rounded-xl border border-ink-600 bg-ink-800/60">
          <TrendingList
            tokens={tokens}
            selected={selected.address}
            onSelect={pick}
          />
        </div>
      </div>
    </div>
  );
}
