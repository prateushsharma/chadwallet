"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Candle } from "@/lib/types";

export interface OHLC { open: number; high: number; low: number; close: number; }

export function PriceChart({
  address,
  timeframe = "15m",
  onHover,
  onTimeframeChange,
}: {
  address: string;
  timeframe?: string;
  onHover?: (c: OHLC | null) => void;
  onTimeframeChange?: (tf: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const lastRef = useRef<Candle | null>(null);
  const volRef = useRef<any>(null);
  const pollRef = useRef<any>(null);
  const logRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let chart: any;
    let ro: ResizeObserver | undefined;
    let disposed = false;

    async function build() {
      setLoading(true);
      setEmpty(false);
      const { createChart, ColorType, CrosshairMode } = await import("lightweight-charts");
      if (disposed || !ref.current) return;

      let candles: Candle[] = [];
      try {
        const r = await api.candles(address, timeframe);
        candles = r.candles ?? [];
      } catch { candles = []; }
      if (disposed || !ref.current) return;
      if (!candles.length) { setEmpty(true); setLoading(false); return; }
      lastRef.current = candles[candles.length - 1];

      chart = createChart(ref.current, {
        layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#888B96", fontFamily: "var(--font-mono), monospace" },
        grid: { vertLines: { color: "rgba(255,255,255,0.04)" }, horzLines: { color: "rgba(255,255,255,0.04)" } },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: "#20212A" },
        timeScale: { borderColor: "#20212A", timeVisible: true, secondsVisible: false },
        height: ref.current.clientHeight || 360,
        width: ref.current.clientWidth,
        handleScroll: true,
        handleScale: true,
      });
      chartRef.current = chart;

      const series = chart.addCandlestickSeries({
        upColor: "#26ED80", downColor: "#FF5C5C", borderUpColor: "#26ED80",
        borderDownColor: "#FF5C5C", wickUpColor: "#26ED80", wickDownColor: "#FF5C5C",
        priceFormat: { type: "price", precision: 8, minMove: 0.00000001 },
      });
      seriesRef.current = series;
      series.setData(candles.map((c) => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));

      const vol = chart.addHistogramSeries({ priceFormat: { type: "volume" }, priceScaleId: "vol" });
      chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      vol.setData(candles.map((c) => ({ time: c.time as any, value: c.volume, color: c.close >= c.open ? "rgba(38,237,128,0.3)" : "rgba(255,92,92,0.3)" })));
      volRef.current = vol;

      chart.timeScale().fitContent();
      setLoading(false);

      // live OHLC readout on crosshair
      chart.subscribeCrosshairMove((param: any) => {
        if (!onHover) return;
        const d = param?.seriesData?.get(series);
        if (d) onHover({ open: d.open, high: d.high, low: d.low, close: d.close });
        else onHover(lastRef.current as any);
      });

      // live: poll latest candles and update the forming bar (+ append new bars)
      pollRef.current = setInterval(async () => {
        if (disposed) return;
        try {
          const r = await api.candles(address, timeframe);
          const cs: Candle[] = r.candles ?? [];
          if (!cs.length) return;
          const since = lastRef.current?.time ?? 0;
          for (const c of cs) {
            if (c.time < since) continue; // keep updates in ascending time order
            series.update({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close });
            volRef.current?.update({ time: c.time as any, value: c.volume, color: c.close >= c.open ? "rgba(38,237,128,0.3)" : "rgba(255,92,92,0.3)" });
          }
          lastRef.current = cs[cs.length - 1];
          setLive(true);
          setTimeout(() => { if (!disposed) setLive(false); }, 1400);
        } catch { /* keep last good chart */ }
      }, 8000);

      ro = new ResizeObserver(() => {
        if (ref.current && chart) chart.applyOptions({ width: ref.current.clientWidth, height: ref.current.clientHeight });
      });
      ro.observe(ref.current);
    }

    build();
    return () => { disposed = true; clearInterval(pollRef.current); ro?.disconnect(); chart?.remove?.(); chartRef.current = null; };
  }, [address, timeframe]); // refetch when timeframe changes

  // right-click menu
  function zoom(factor: number) {
    const ts = chartRef.current?.timeScale();
    if (!ts) return;
    const cur = ts.options().barSpacing ?? 6;
    ts.applyOptions({ barSpacing: Math.max(1, Math.min(80, cur * factor)) });
  }
  function scroll(delta: number) {
    const ts = chartRef.current?.timeScale();
    if (!ts) return;
    ts.scrollToPosition((ts.scrollPosition() ?? 0) + delta, true);
  }
  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    const rect = ref.current?.getBoundingClientRect();
    setMenu({ x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
  }
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menu]);

  const TF = ["1m", "5m", "15m", "1H", "4H", "1D"];

  return (
    <div className="group relative h-[360px] w-full" onContextMenu={onContextMenu}>
      <div ref={ref} className="h-full w-full" />
      {!loading && !empty && (
        <div className="pointer-events-none absolute left-2 top-2 z-30 flex items-center gap-1.5 rounded-md bg-ink-900/70 px-1.5 py-0.5 backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-mint opacity-75 ${live ? "animate-ping" : ""}`} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
          </span>
          <span className="led text-[10px] font-bold uppercase tracking-wide text-mint">Live</span>
        </div>
      )}
      {loading && <div className="absolute inset-0 flex items-center justify-center"><span className="led text-sm text-muted">loading chart…</span></div>}
      {empty && <div className="absolute inset-0 flex items-center justify-center"><span className="led text-sm text-muted">No chart data.</span></div>}

      {/* hover navigation controls (zoom / scroll / reset) */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-ink-600 bg-ink-800/90 p-1 opacity-0 shadow-panel backdrop-blur transition group-hover:pointer-events-auto group-hover:opacity-100">
        <Ctrl title="Zoom out" onClick={() => zoom(1 / 1.3)}>−</Ctrl>
        <Ctrl title="Zoom in" onClick={() => zoom(1.3)}>+</Ctrl>
        <Ctrl title="Scroll left" onClick={() => scroll(-8)}>‹</Ctrl>
        <Ctrl title="Scroll right" onClick={() => scroll(8)}>›</Ctrl>
        <Ctrl title="Reset view" onClick={() => chartRef.current?.timeScale().fitContent()}>⟲</Ctrl>
      </div>

      {menu && (
        <div
          className="absolute z-50 w-52 overflow-hidden rounded-lg border border-ink-500 bg-ink-800 py-1 text-sm shadow-panel"
          style={{ left: Math.min(menu.x, (ref.current?.clientWidth ?? 400) - 210), top: menu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <Item onClick={() => { chartRef.current?.timeScale().fitContent(); setMenu(null); }}>Reset chart view</Item>
          <Item onClick={() => { navigator.clipboard?.writeText(String(lastRef.current?.close ?? "")); setMenu(null); }}>
            Copy price {lastRef.current ? `$${lastRef.current.close.toPrecision(4)}` : ""}
          </Item>
          <Item onClick={() => { logRef.current = !logRef.current; chartRef.current?.priceScale("right").applyOptions({ mode: logRef.current ? 1 : 0 }); setMenu(null); }}>
            {logRef.current ? "Linear scale" : "Logarithmic scale"}
          </Item>
          <div className="my-1 border-t border-ink-600" />
          <p className="px-3 py-1 text-[10px] uppercase tracking-wide text-muted">Timeframe</p>
          <div className="grid grid-cols-3 gap-1 px-2 pb-1">
            {TF.map((t) => (
              <button
                key={t}
                onClick={() => { onTimeframeChange?.(t); setMenu(null); }}
                className={`led rounded py-1 text-xs ${t === timeframe ? "bg-chad text-ink" : "bg-ink-700 text-muted hover:text-bone"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="block w-full px-3 py-1.5 text-left text-bone hover:bg-ink-700">
      {children}
    </button>
  );
}

function Ctrl({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} className="grid h-7 w-7 place-items-center rounded-md text-base text-muted hover:bg-ink-700 hover:text-bone">
      {children}
    </button>
  );
}
