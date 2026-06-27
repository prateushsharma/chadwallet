"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { MOCK_TOKENS } from "@/lib/mock";
import { Token } from "@/lib/types";
import { LeftPanel } from "./LeftPanel";
import { ChartArea } from "./ChartArea";
import { TokenHeader } from "./TokenPanels";
import { ActivityTable } from "./ActivityTable";
import { SwapPanel } from "./SwapPanel";

export function TradeTerminal() {
  const router = useRouter();
  const params = useSearchParams();
  const wanted = params.get("token");

  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS);
  const [selected, setSelected] = useState<Token>(
    MOCK_TOKENS.find((t) => t.address === wanted) ?? MOCK_TOKENS[0]
  );

  useEffect(() => {
    api.trending().then((r) => {
      if (r.tokens?.length) {
        setTokens(r.tokens);
        if (!wanted) setSelected(r.tokens[0]);
        else {
          const hit = r.tokens.find((t) => t.address === wanted);
          if (hit) setSelected(hit);
        }
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!wanted) return;
    const known = tokens.find((t) => t.address === wanted);
    if (known) setSelected(known);
    api.token(wanted).then((r) => r.token?.address && setSelected(r.token)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted]);

  const solPrice = tokens.find((t) => t.symbol === "SOL")?.price ?? MOCK_TOKENS[0].price ?? 160;

  function pick(t: Token) {
    setSelected(t);
    router.push(`/trade?token=${t.address}`, { scroll: false });
  }

  return (
    <div className="grid h-[calc(100vh-92px)] grid-cols-1 lg:grid-cols-[280px_1fr_330px]">
      {/* Left — feed / tokens */}
      <aside className="hidden min-h-0 overflow-hidden border-r border-ink-600 lg:block">
        <LeftPanel token={selected} tokens={tokens} selected={selected.address} onSelect={pick} />
      </aside>

      {/* Middle — header + chart + activity */}
      <section className="flex min-h-0 min-w-0 flex-col overflow-y-auto scroll-thin">
        <TokenHeader token={selected} />
        <ChartArea token={selected} />
        <div className="min-h-[300px] flex-1 border-t border-ink-600">
          <ActivityTable token={selected} />
        </div>
      </section>

      {/* Right — buy + about + positions */}
      <aside className="min-h-0 overflow-hidden border-l border-ink-600">
        <SwapPanel token={selected} solPriceUsd={solPrice} />
      </aside>
    </div>
  );
}
