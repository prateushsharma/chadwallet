"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Candle } from "@/lib/types";

export interface OHLC { open: number; high: number; low: number; close: number; }
export interface LegendData {
  o: number; h: number; l: number; c: number;
  vol: number; chAbs: number; chPct: number; up: boolean;
}
export interface ChartHandle {
  fitContent(): void;
  zoom(factor: number): void;
  scroll(delta: number): void;
  setPriceMode(mode: 0 | 1 | 2): void; // 0 normal, 1 log, 2 percent
  setAutoScale(on: boolean): void;
  screenshot(): void;
  toggleVolume(): boolean;
  setCrosshairVert(on: boolean): void;
  getCandles(): Candle[];
}

// fomo / TradingView dark theme
const BG = "#060510";
const UP = "#21C95E";
const DOWN = "#FF622E";
const UP_VOL = "rgba(33,201,94,0.35)";
const DOWN_VOL = "rgba(255,98,46,0.35)";

export const PriceChart = forwardRef<ChartHandle, {
  address: string;
  timeframe?: string;
  onLegend?: (d: LegendData | null) => void;
}>(function PriceChart({ address, timeframe = "15m", onLegend }, ref) {
  const el = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const volRef = useRef<any>(null);
  const lastRef = useRef<Candle | null>(null);
  const candlesRef = useRef<Candle[]>([]);
  const volHiddenRef = useRef(false);
  const pollRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  const emit = (c: { open: number; high: number; low: number; close: number; volume?: number } | null) => {
    if (!onLegend) return;
    if (!c) { onLegend(null); return; }
    const up = c.close >= c.open;
    onLegend({ o: c.open, h: c.high, l: c.low, c: c.close, vol: c.volume ?? 0, chAbs: c.close - c.open, chPct: c.open ? ((c.close - c.open) / c.open) * 100 : 0, up });
  };

  useImperativeHandle(ref, () => ({
    fitContent() { chartRef.current?.timeScale().fitContent(); },
    zoom(factor: number) {
      const ts = chartRef.current?.timeScale(); if (!ts) return;
      const cur = ts.options().barSpacing ?? 6;
      ts.applyOptions({ barSpacing: Math.max(1, Math.min(80, cur * factor)) });
    },
    scroll(delta: number) {
      const ts = chartRef.current?.timeScale(); if (!ts) return;
      ts.scrollToPosition((ts.scrollPosition() ?? 0) + delta, true);
    },
    setPriceMode(mode) { chartRef.current?.priceScale("right").applyOptions({ mode }); },
    setAutoScale(on) { chartRef.current?.priceScale("right").applyOptions({ autoScale: on }); },
    screenshot() {
      const cv = chartRef.current?.takeScreenshot?.(); if (!cv) return;
      cv.toBlob?.((b: Blob | null) => {
        if (!b) return;
        const url = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url; a.download = "chart.png"; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    },
    toggleVolume() {
      volHiddenRef.current = !volHiddenRef.current;
      volRef.current?.applyOptions({ visible: !volHiddenRef.current });
      return volHiddenRef.current;
    },
    setCrosshairVert(on: boolean) {
      chartRef.current?.applyOptions({ crosshair: { vertLine: { visible: on } } });
    },
    getCandles() { return candlesRef.current; },
  }), []);

  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | undefined;

    async function build() {
      setLoading(true); setEmpty(false);
      const { createChart, ColorType, CrosshairMode } = await import("lightweight-charts");
      if (disposed || !el.current) return;

      let candles: Candle[] = [];
      try { candles = (await api.candles(address, timeframe)).candles ?? []; } catch { candles = []; }
      if (disposed || !el.current) return;
      if (!candles.length) { setEmpty(true); setLoading(false); emit(null); return; }
      lastRef.current = candles[candles.length - 1];
      candlesRef.current = candles;

      const chart = createChart(el.current, {
        layout: { background: { type: ColorType.Solid, color: BG }, textColor: "#787B86", fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif", fontSize: 11 },
        grid: { vertLines: { color: "rgba(255,255,255,0.04)" }, horzLines: { color: "rgba(255,255,255,0.04)" } },
        crosshair: { mode: CrosshairMode.Normal, vertLine: { color: "rgba(255,255,255,0.25)", labelBackgroundColor: "#2A2A3C" }, horzLine: { color: "rgba(255,255,255,0.25)", labelBackgroundColor: "#2A2A3C" } },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.08)", scaleMargins: { top: 0.08, bottom: 0.28 } },
        timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true, secondsVisible: false },
        height: el.current.clientHeight || 300,
        width: el.current.clientWidth,
        handleScroll: true, handleScale: true,
      });
      chartRef.current = chart;

      const series = chart.addCandlestickSeries({
        upColor: UP, downColor: DOWN, borderUpColor: UP, borderDownColor: DOWN, wickUpColor: UP, wickDownColor: DOWN,
        priceFormat: { type: "price", precision: 6, minMove: 0.000001 },
      });
      seriesRef.current = series;
      series.setData(candles.map((c) => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));

      const vol = chart.addHistogramSeries({ priceFormat: { type: "volume" }, priceScaleId: "vol" });
      chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
      vol.setData(candles.map((c) => ({ time: c.time as any, value: c.volume, color: c.close >= c.open ? UP_VOL : DOWN_VOL })));
      volRef.current = vol;

      chart.timeScale().fitContent();
      setLoading(false);
      emit(lastRef.current); // default legend = last bar

      chart.subscribeCrosshairMove((param: any) => {
        const d = param?.seriesData?.get(series);
        const v = param?.seriesData?.get(vol);
        if (d) emit({ open: d.open, high: d.high, low: d.low, close: d.close, volume: v?.value ?? 0 });
        else emit(lastRef.current);
      });

      pollRef.current = setInterval(async () => {
        if (disposed) return;
        try {
          const cs: Candle[] = (await api.candles(address, timeframe)).candles ?? [];
          if (!cs.length) return;
          const since = lastRef.current?.time ?? 0;
          for (const c of cs) {
            if (c.time < since) continue;
            series.update({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close });
            volRef.current?.update({ time: c.time as any, value: c.volume, color: c.close >= c.open ? UP_VOL : DOWN_VOL });
          }
          lastRef.current = cs[cs.length - 1];
          candlesRef.current = cs;
          emit(lastRef.current);
        } catch { /* keep last good chart */ }
      }, 8000);

      ro = new ResizeObserver(() => { if (el.current && chartRef.current) chartRef.current.applyOptions({ width: el.current.clientWidth, height: el.current.clientHeight }); });
      ro.observe(el.current);
    }

    build();
    return () => { disposed = true; clearInterval(pollRef.current); ro?.disconnect(); chartRef.current?.remove?.(); chartRef.current = null; };
  }, [address, timeframe]);

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="h-full w-full" />
      {loading && <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm text-text-tertiary">loading chart…</span></div>}
      {empty && <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm text-text-tertiary">No chart data.</span></div>}
    </div>
  );
});
