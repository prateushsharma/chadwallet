"use client";

import React from "react";
import { Token } from "@/lib/types";
import { TradingViewChart } from "./TradingViewChart";

/* fomo's chart is the TradingView Advanced Chart widget, so ChadWallet embeds the same widget.
   All of TradingView's toolbars/tools are native and functional — an exact match to fomo.
   (Chart data is TradingView's feed for the mapped symbol; the rest of the page uses BirdEye.
   A BirdEye lightweight-charts renderer remains in PriceChart.tsx if a self-fed chart is wanted.) */

export function ChartArea({ token }: { token: Token }) {
  return (
    <div className="flex flex-col bg-bg-primary">
      <div className="h-[460px] w-full">
        <TradingViewChart symbol={token.symbol} />
      </div>
    </div>
  );
}
