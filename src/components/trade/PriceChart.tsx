"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Candle } from "@/lib/types";

export function PriceChart({ address }: { address: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    let chart: any;
    let ro: ResizeObserver | undefined;
    let disposed = false;

    async function build() {
      setLoading(true);
      setEmpty(false);
      const { createChart, ColorType, CrosshairMode } = await import(
        "lightweight-charts"
      );
      if (disposed || !ref.current) return;

      let candles: Candle[] = [];
      try {
        const r = await api.candles(address);
        candles = r.candles ?? [];
      } catch {
        candles = [];
      }
      if (disposed || !ref.current) return;
      if (!candles.length) {
        setEmpty(true);
        setLoading(false);
        return;
      }

      chart = createChart(ref.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#8A8F7E",
          fontFamily: "var(--font-mono), monospace",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.04)" },
          horzLines: { color: "rgba(255,255,255,0.04)" },
        },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: "#24281E" },
        timeScale: { borderColor: "#24281E", timeVisible: true, secondsVisible: false },
        height: ref.current.clientHeight || 360,
        width: ref.current.clientWidth,
        autoSize: false,
      });

      const series = chart.addCandlestickSeries({
        upColor: "#3DE389",
        downColor: "#FF5C38",
        borderUpColor: "#3DE389",
        borderDownColor: "#FF5C38",
        wickUpColor: "#3DE389",
        wickDownColor: "#FF5C38",
        priceFormat: { type: "price", precision: 8, minMove: 0.00000001 },
      });
      series.setData(
        candles.map((c) => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      const vol = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "vol",
        color: "rgba(215,255,62,0.25)",
      });
      chart.priceScale("vol").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });
      vol.setData(
        candles.map((c) => ({
          time: c.time as any,
          value: c.volume,
          color:
            c.close >= c.open
              ? "rgba(61,227,137,0.3)"
              : "rgba(255,92,56,0.3)",
        }))
      );

      chart.timeScale().fitContent();
      setLoading(false);

      ro = new ResizeObserver(() => {
        if (ref.current && chart) {
          chart.applyOptions({
            width: ref.current.clientWidth,
            height: ref.current.clientHeight,
          });
        }
      });
      ro.observe(ref.current);
    }

    build();
    return () => {
      disposed = true;
      ro?.disconnect();
      chart?.remove?.();
    };
  }, [address]);

  return (
    <div className="relative h-[360px] w-full">
      <div ref={ref} className="h-full w-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="led text-sm text-muted">loading chart…</span>
        </div>
      )}
      {empty && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="led text-sm text-muted">No chart data available.</span>
        </div>
      )}
    </div>
  );
}
