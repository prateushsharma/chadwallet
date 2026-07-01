"use client";

import React, { useEffect, useRef, useState } from "react";
import { Token } from "@/lib/types";
import { PriceChart, ChartHandle, LegendData } from "./PriceChart";

/* fomo's chart is TradingView Advanced Charts. TradingView's engine/CSS aren't redistributable,
   so this reproduces fomo's exact shell — its TradingView SVG icons + layout — styled with our
   tokens, wrapping REAL BirdEye candles (lightweight-charts). The buttons that map to our chart
   are wired (interval, date range, log/%/auto, zoom/reset, fullscreen, snapshot); the drawing /
   indicator tools render identically but are visual (they need TradingView's engine). */

const TFS = ["1m", "5m", "15m", "1H", "4H", "1D"];
const RANGES: { label: string; tf: string }[] = [
  { label: "1D", tf: "15m" }, { label: "1W", tf: "1H" }, { label: "1M", tf: "4H" },
  { label: "3M", tf: "1D" }, { label: "1Y", tf: "1D" },
];

const lp = (n: number) => (n >= 1 ? n.toFixed(2) : n >= 0.01 ? n.toFixed(4) : n.toPrecision(4));
const lv = (v: number) => (v >= 1e6 ? (v / 1e6).toFixed(2) + " M" : v >= 1e3 ? (v / 1e3).toFixed(2) + " K" : v.toFixed(2));
const lc = (abs: number, pct: number) => { const n = abs < 0; return `${n ? "−" : ""}${Math.abs(abs).toFixed(2)} (${n ? "−" : ""}${Math.abs(pct).toFixed(2)}%)`; };

/* ---- icon primitives (verbatim TradingView paths) ---- */
function I({ children, w = 28 }: { children: React.ReactNode; w?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={w} height={w} aria-hidden="true">{children}</svg>;
}
// top toolbar buttons (34x34 hit area)
function TB({ children, active, disabled, onClick, title, text }: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void; title?: string; text?: string }) {
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick}
      className={`flex h-[34px] items-center justify-center gap-1 rounded ${text ? "px-2" : "w-[34px]"} transition-colors ${
        disabled ? "cursor-default text-text-tertiary/40" : active ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:bg-bg-tertiary/60 hover:text-text-primary"
      }`}>
      {children}{text && <span className="text-[13px] font-medium">{text}</span>}
    </button>
  );
}
const Sep = () => <div className="mx-1 h-5 w-px shrink-0 bg-bg-tertiary" />;
// left rail tool (40 tall)
function LT({ children, active, onClick, title }: { children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={`flex h-10 w-full items-center justify-center rounded transition-colors ${active ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:bg-bg-tertiary/60 hover:text-text-primary"}`}>
      {children}
    </button>
  );
}
// bottom bar text button
function BB({ children, active, onClick, title }: { children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={`flex h-7 items-center justify-center gap-1 rounded px-2 text-[13px] transition-colors ${active ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:bg-bg-tertiary/60 hover:text-text-primary"}`}>
      {children}
    </button>
  );
}
// legend 18x18 action icon
function LG({ children }: { children: React.ReactNode }) {
  return <button type="button" className="flex h-[18px] w-[18px] items-center justify-center text-text-tertiary hover:text-text-primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">{children}</svg></button>;
}
const EyeIcon = <><g><path fill="currentColor" fillRule="evenodd" d="M12 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" /><path fill="currentColor" d="M16.91 8.8C15.31 4.99 12.18 3 9 3 5.82 3 2.7 4.98 1.08 8.8L1 9l.08.2C2.7 13.02 5.82 15 9 15c3.18 0 6.3-1.97 7.91-5.8L17 9l-.09-.2ZM9 14c-2.69 0-5.42-1.63-6.91-5 1.49-3.37 4.22-5 6.9-5 2.7 0 5.43 1.63 6.92 5-1.5 3.37-4.23 5-6.91 5Z" /></g></>;
const MoreIcon = <path fill="currentColor" fillRule="evenodd" d="M3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7-2a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm1 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />;

export function ChartArea({ token }: { token: Token }) {
  const chart = useRef<ChartHandle>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [tf, setTf] = useState("15m");
  const [range, setRange] = useState<string | null>("1D");
  const [leg, setLeg] = useState<LegendData | null>(null);
  const [intOpen, setIntOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(true);
  const [mode, setMode] = useState<0 | 1 | 2>(0); // 0 normal, 1 log, 2 percent
  const [auto, setAuto] = useState(true);
  const [clock, setClock] = useState("");

  useEffect(() => { const t = () => setClock(new Date().toUTCString().slice(17, 25)); t(); const id = setInterval(t, 1000); return () => clearInterval(id); }, []);
  useEffect(() => { chart.current?.setPriceMode(mode); }, [mode]);
  useEffect(() => { chart.current?.setAutoScale(auto); }, [auto]);
  useEffect(() => { if (!intOpen) return; const c = () => setIntOpen(false); window.addEventListener("click", c); return () => window.removeEventListener("click", c); }, [intOpen]);

  const col = leg ? (leg.up ? "text-green" : "text-red") : "text-text-tertiary";
  const pickRange = (r: { label: string; tf: string }) => { setRange(r.label); setTf(r.tf); };
  const fullscreen = () => { const e = wrap.current; if (!e) return; document.fullscreenElement ? document.exitFullscreen() : e.requestFullscreen?.(); };

  return (
    <div ref={wrap} className="flex flex-col bg-bg-primary">
      {/* ===== top toolbar ===== */}
      <div className="flex h-[38px] items-center border-b border-bg-tertiary px-1">
        <Sep />
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setIntOpen((v) => !v)} title="Interval"
            className="flex h-[34px] items-center rounded px-2 text-[13px] font-medium text-text-primary transition-colors hover:bg-bg-tertiary/60">
            {tf}
          </button>
          {intOpen && (
            <div className="absolute left-0 top-[38px] z-modal min-w-24 rounded-lg border border-bg-tertiary bg-bg-secondary py-1 shadow-xl">
              {TFS.map((x) => (
                <button key={x} onClick={() => { setTf(x); setRange(null); setIntOpen(false); }}
                  className={`block w-full px-3 py-1.5 text-left text-[13px] ${x === tf ? "text-text-primary" : "text-text-secondary hover:bg-bg-tertiary/60 hover:text-text-primary"}`}>
                  {x}
                </button>
              ))}
            </div>
          )}
        </div>
        <Sep />
        <TB title="Candles" active>
          <I><g fill="currentColor"><path d="M17 11v6h3v-6h-3zm-.5-1h4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5z" /><path d="M18 7h1v3.5h-1zm0 10.5h1V21h-1z" /><path d="M9 8v12h3V8H9zm-.5-1h4a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5z" /><path d="M10 4h1v3.5h-1zm0 16.5h1V24h-1z" /></g></I>
        </TB>
        <Sep />
        <TB title="Indicators & Strategies" text="Indicators"><I><path stroke="currentColor" fill="none" d="M20 17l-5 5M15 17l5 5M9 11.5h7M17.5 8a2.5 2.5 0 0 0-5 0v11a2.5 2.5 0 0 1-5 0" /></I></TB>
        <Sep />
        <div className="flex h-[34px] items-center whitespace-nowrap px-1.5 text-xs font-medium text-text-primary">
          <span style={{ color: "#516AF6" }}>Price</span>&nbsp;/ MCap
        </div>
        <Sep />
        <TB title="Undo" disabled><I><path fill="currentColor" d="M8.707 13l2.647 2.646-.707.708L6.792 12.5l3.853-3.854.708.708L8.707 12H14.5a5.5 5.5 0 0 1 5.5 5.5V19h-1v-1.5a4.5 4.5 0 0 0-4.5-4.5H8.707z" /></I></TB>
        <TB title="Redo" disabled><I><path fill="currentColor" d="M18.293 13l-2.647 2.646.707.708 3.854-3.854-3.854-3.854-.707.708L18.293 12H12.5A5.5 5.5 0 0 0 7 17.5V19h1v-1.5a4.5 4.5 0 0 1 4.5-4.5h5.793z" /></I></TB>
        <div className="flex-1" />
        <Sep />
        <TB title="Quick Search"><I><g fill="currentColor"><path d="M17 4v4h2a1 1 0 0 1 .83 1.55l-4 6A1 1 0 0 1 14 15v-4h-2a1 1 0 0 1-.83-1.55l4-6A1 1 0 0 1 17 4m-2 11 4-6h-3V4l-4 6h3z" /><path d="M5 13.5a7.5 7.5 0 0 1 6-7.35v1.02A6.5 6.5 0 1 0 18.98 13h1l.02.5a7.47 7.47 0 0 1-1.85 4.94L23 23.29l-.71.7-4.85-4.84A7.5 7.5 0 0 1 5 13.5" /></g></I></TB>
        <TB title="Settings"><I><g fill="currentColor"><path fillRule="evenodd" d="M18 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-1 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path fillRule="evenodd" d="M8.5 5h11l5 9-5 9h-11l-5-9 5-9Zm-3.86 9L9.1 6h9.82l4.45 8-4.45 8H9.1l-4.45-8Z" /></g></I></TB>
        <TB title="Fullscreen mode" onClick={fullscreen}><I><path fill="currentColor" d="M8.5 6A2.5 2.5 0 0 0 6 8.5V11h1V8.5C7 7.67 7.67 7 8.5 7H11V6H8.5zM6 17v2.5A2.5 2.5 0 0 0 8.5 22H11v-1H8.5A1.5 1.5 0 0 1 7 19.5V17H6zM19.5 7H17V6h2.5A2.5 2.5 0 0 1 22 8.5V11h-1V8.5c0-.83-.67-1.5-1.5-1.5zM22 19.5V17h-1v2.5c0 .83-.67 1.5-1.5 1.5H17v1h2.5a2.5 2.5 0 0 0 2.5-2.5z" /></I></TB>
        <TB title="Take a snapshot" onClick={() => chart.current?.screenshot()}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M11.118 6a.5.5 0 0 0-.447.276L9.809 8H5.5A1.5 1.5 0 0 0 4 9.5v10A1.5 1.5 0 0 0 5.5 21h16a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 21.5 8h-4.309l-.862-1.724A.5.5 0 0 0 15.882 6h-4.764zm-1.342-.17A1.5 1.5 0 0 1 11.118 5h4.764a1.5 1.5 0 0 1 1.342.83L17.809 7H21.5A2.5 2.5 0 0 1 24 9.5v10a2.5 2.5 0 0 1-2.5 2.5h-16A2.5 2.5 0 0 1 3 19.5v-10A2.5 2.5 0 0 1 5.5 7h3.691l.585-1.17z" /><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M13.5 18a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0 1a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" /></svg></TB>
      </div>

      {/* ===== middle: left rail + chart ===== */}
      <div className="flex h-[380px]">
        {/* left drawing rail */}
        {drawOpen && (
          <div className="flex w-[52px] flex-col items-center border-r border-bg-tertiary bg-bg-primary py-1">
            <div className="flex w-full flex-col items-center gap-0.5 px-1.5">
              <LT title="Cross" active><I><g fill="currentColor"><path d="M18 15h8v-1h-8z" /><path d="M14 18v8h1v-8zM14 3v8h1v-8zM3 15h8v-1h-8z" /></g></I></LT>
              <LT title="Trend Line"><I><g fill="currentColor" fillRule="nonzero"><path d="M7.354 21.354l14-14-.707-.707-14 14z" /><path d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z" /></g></I></LT>
              <LT title="Fib Retracement"><I><g fill="currentColor" fillRule="nonzero"><path d="M3 5h22v-1h-22z" /><path d="M3 17h22v-1h-22z" /><path d="M3 11h19.5v-1h-19.5z" /><path d="M5.5 23h19.5v-1h-19.5z" /><path d="M3.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 12c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z" /></g></I></LT>
              <LT title="XABCD Pattern"><I><g fill="currentColor" fillRule="nonzero"><path d="M20.449 8.505l2.103 9.112.974-.225-2.103-9.112zM13.943 14.011l7.631 4.856.537-.844-7.631-4.856zM14.379 11.716l4.812-3.609-.6-.8-4.812 3.609zM10.96 13.828l-4.721 6.744.819.573 4.721-6.744zM6.331 20.67l2.31-13.088-.985-.174-2.31 13.088zM9.041 7.454l1.995 3.492.868-.496-1.995-3.492z" /><path d="M8.5 7c.828 0 1.5-.672 1.5-1.5S9.328 4 8.5 4 7 4.672 7 5.5 7.672 7 8.5 7zm0 1C7.119 8 6 6.881 6 5.5S7.119 3 8.5 3 11 4.119 11 5.5 9.881 8 8.5 8zM5.5 24c.828 0 1.5-.672 1.5-1.5S6.328 21 5.5 21 4 21.672 4 22.5 4.672 24 5.5 24zm0 1C4.119 25 3 23.881 3 22.5S4.119 20 5.5 20 8 21.119 8 22.5 6.881 25 5.5 25zM12.5 14c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM20.5 8c.828 0 1.5-.672 1.5-1.5S21.328 5 20.5 5 19 5.672 19 6.5 19.672 8 20.5 8zm0 1C19.119 9 18 7.881 18 6.5S19.119 4 20.5 4 23 5.119 23 6.5 21.881 9 20.5 9zM23.5 21c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z" /></g></I></LT>
              <LT title="Long Position"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" fill="none" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M4.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 6.5A2.5 2.5 0 0 1 6.95 6H24v1H6.95A2.5 2.5 0 0 1 2 6.5zM4.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 16.5a2.5 2.5 0 0 1 4.95-.5h13.1a2.5 2.5 0 1 1 0 1H6.95A2.5 2.5 0 0 1 2 16.5zM22.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-18 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 22.5a2.5 2.5 0 0 1 4.95-.5H24v1H6.95A2.5 2.5 0 0 1 2 22.5z" /><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M22.4 8.94l-1.39.63-.41-.91 1.39-.63.41.91zm-4 1.8l-1.39.63-.41-.91 1.39-.63.41.91zm-4 1.8l-1.4.63-.4-.91 1.39-.63.41.91zm-4 1.8l-1.4.63-.4-.91 1.39-.63.41.91z" /></svg></LT>
              <LT title="Brush"><I><g fill="currentColor" fillRule="nonzero"><path d="M1.789 23l.859-.854.221-.228c.18-.19.38-.409.597-.655.619-.704 1.238-1.478 1.815-2.298.982-1.396 1.738-2.776 2.177-4.081 1.234-3.667 5.957-4.716 8.923-1.263 3.251 3.785-.037 9.38-5.379 9.38h-9.211zm9.211-1c4.544 0 7.272-4.642 4.621-7.728-2.45-2.853-6.225-2.015-7.216.931-.474 1.408-1.273 2.869-2.307 4.337-.599.852-1.241 1.653-1.882 2.383l-.068.078h6.853z" /><path d="M18.182 6.002l-1.419 1.286c-1.031.935-1.075 2.501-.096 3.48l1.877 1.877c.976.976 2.553.954 3.513-.045l5.65-5.874-.721-.693-5.65 5.874c-.574.596-1.507.609-2.086.031l-1.877-1.877c-.574-.574-.548-1.48.061-2.032l1.419-1.286-.672-.741z" /></g></I></LT>
              <LT title="Text"><I><path fill="currentColor" d="M8 6.5c0-.28.22-.5.5-.5H14v16h-2v1h5v-1h-2V6h5.5c.28 0 .5.22.5.5V9h1V6.5c0-.83-.67-1.5-1.5-1.5h-12C7.67 5 7 5.67 7 6.5V9h1V6.5Z" /></I></LT>
              <LT title="Icon"><I><path fill="currentColor" d="M4.05 14a9.95 9.95 0 1 1 19.9 0 9.95 9.95 0 0 1-19.9 0ZM14 3a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm-3 13.03a.5.5 0 0 1 .64.3 2.5 2.5 0 0 0 4.72 0 .5.5 0 0 1 .94.34 3.5 3.5 0 0 1-6.6 0 .5.5 0 0 1 .3-.64Zm.5-4.53a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" /></I></LT>
            </div>
            <div className="my-1 h-px w-7 bg-bg-tertiary" />
            <div className="flex w-full flex-col items-center gap-0.5 px-1.5">
              <LT title="Measure"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path fill="currentColor" d="M2 9.75a1.5 1.5 0 0 0-1.5 1.5v5.5a1.5 1.5 0 0 0 1.5 1.5h24a1.5 1.5 0 0 0 1.5-1.5v-5.5a1.5 1.5 0 0 0-1.5-1.5zm0 1h3v2.5h1v-2.5h3.25v3.9h1v-3.9h3.25v2.5h1v-2.5h3.25v3.9h1v-3.9H22v2.5h1v-2.5h3a.5.5 0 0 1 .5.5v5.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-5.5a.5.5 0 0 1 .5-.5z" transform="rotate(-45 14 14)" /></svg></LT>
              <LT title="Zoom In"><I><g fill="currentColor"><path d="M17.646 18.354l4 4 .708-.708-4-4z" /><path d="M12.5 21a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17zm0-1a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z" /><path d="M9 13h7v-1H9z" /><path d="M13 16V9h-1v7z" /></g></I></LT>
            </div>
            <div className="my-1 h-px w-7 bg-bg-tertiary" />
            <div className="flex w-full flex-col items-center gap-0.5 px-1.5">
              <LT title="Magnet Mode"><I><g fill="currentColor" fillRule="evenodd"><path fillRule="nonzero" d="M14 10a2 2 0 0 0-2 2v11H6V12c0-4.416 3.584-8 8-8s8 3.584 8 8v11h-6V12a2 2 0 0 0-2-2zm-3 2a3 3 0 0 1 6 0v10h4V12c0-3.864-3.136-7-7-7s-7 3.136-7 7v10h4V12z" /><path d="M6.5 18h5v1h-5zm10 0h5v1h-5z" /></g></I></LT>
              <LT title="Keep drawing"><I><path fill="currentColor" d="M17.27 4.56a2.5 2.5 0 0 0-3.54 0l-.58.59-9 9-1 1-.15.14V20h4.7l.15-.15 1-1 9-9 .59-.58a2.5 2.5 0 0 0 0-3.54l-1.17-1.17Zm-2.83.7a1.5 1.5 0 0 1 2.12 0l1.17 1.18a1.5 1.5 0 0 1 0 2.12l-.23.23-3.3-3.29.24-.23Zm-.94.95 3.3 3.29-8.3 8.3-3.3-3.3 8.3-8.3Zm-9 9 3.3 3.29-.5.5H4v-3.3l.5-.5Zm16.5.29a1.5 1.5 0 0 0-3 0V18h4.5c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5v-4c0-.83.67-1.5 1.5-1.5h.5v-2.5a2.5 2.5 0 0 1 5 0v.5h-1v-.5ZM16.5 19a.5.5 0 0 0-.5.5v4c0 .28.22.5.5.5h6a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-6Zm2.5 4v-2h1v2h-1Z" /></I></LT>
              <LT title="Lock all drawings"><I><path fill="currentColor" fillRule="evenodd" d="M14 6a3 3 0 0 0-3 3v3h8.5a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 6 21.5v-7A2.5 2.5 0 0 1 8.5 12H10V9a4 4 0 0 1 8 0h-1a3 3 0 0 0-3-3zm-1 11a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-6-2.5c0-.83.67-1.5 1.5-1.5h11c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5h-11A1.5 1.5 0 0 1 7 21.5v-7z" /></I></LT>
              <LT title="Hide all drawings"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M5 10.76l-.41-.72-.03-.04.03-.04a15 15 0 012.09-2.9c1.47-1.6 3.6-3.12 6.32-3.12 2.73 0 4.85 1.53 6.33 3.12a15.01 15.01 0 012.08 2.9l.03.04-.03.04a15 15 0 01-2.09 2.9c-1.47 1.6-3.6 3.12-6.32 3.12-2.73 0-4.85-1.53-6.33-3.12a15 15 0 01-1.66-2.18zm5.35-.76A2.6 2.6 0 0113 7.44 2.6 2.6 0 0115.65 10 2.6 2.6 0 0113 12.56 2.6 2.6 0 0110.35 10zM13 6.44A3.6 3.6 0 009.35 10 3.6 3.6 0 0013 13.56c2 0 3.65-1.58 3.65-3.56A3.6 3.6 0 0013 6.44z" /></svg></LT>
            </div>
            <div className="my-1 h-px w-7 bg-bg-tertiary" />
            <div className="flex w-full flex-col items-center gap-0.5 px-1.5">
              <LT title="Remove drawings"><I><path fill="currentColor" d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z" /></I></LT>
            </div>
            <div className="flex-1" />
            <div className="flex w-full flex-col items-center gap-0.5 px-1.5">
              <LT title="Show Object Tree"><I><g fill="currentColor"><path fillRule="nonzero" d="M14 18.634l-.307-.239-7.37-5.73-2.137-1.665 9.814-7.633 9.816 7.634-.509.394-1.639 1.269-7.667 5.969zm7.054-6.759l1.131-.876-8.184-6.366-8.186 6.367 1.123.875 7.063 5.491 7.054-5.492z" /><path d="M7 14.5l-1 .57 8 6.43 8-6.5-1-.5-7 5.5z" /><path d="M7 17.5l-1 .57 8 6.43 8-6.5-1-.5-7 5.5z" /></g></I></LT>
            </div>
          </div>
        )}
        {/* collapse tab */}
        <button type="button" title={drawOpen ? "Hide Drawings Toolbar" : "Show Drawings Toolbar"} onClick={() => setDrawOpen((v) => !v)}
          className="flex w-[10px] items-center justify-center border-r border-bg-tertiary text-text-tertiary hover:text-text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="27" viewBox="0 0 9 27" aria-hidden="true" className={drawOpen ? "" : "rotate-180"}>
            <path fill="none" stroke="currentColor" d="M5.5 10l-2 3.5 2 3.5" />
          </svg>
        </button>

        {/* chart pane */}
        <div className="group relative flex-1">
          <PriceChart ref={chart} address={token.address} timeframe={tf} onLegend={setLeg} />

          {/* OHLC legend overlay */}
          <div className="pointer-events-none absolute left-2 top-2 z-20 flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: leg ? (leg.up ? "#21C95E" : "#FF622E") : "#787B86" }} />
              <span className="font-medium text-text-primary">{token.name}</span>
              <span className="text-text-tertiary">· {tf} · ChadWallet</span>
              <span className="pointer-events-auto flex items-center gap-0.5">{LG({ children: EyeIcon })}{LG({ children: MoreIcon })}</span>
            </div>
            <div className={`flex flex-wrap items-center gap-x-2 ${col}`}>
              <span><span className="text-text-tertiary">O</span>{leg ? lp(leg.o) : "—"}</span>
              <span><span className="text-text-tertiary">H</span>{leg ? lp(leg.h) : "—"}</span>
              <span><span className="text-text-tertiary">L</span>{leg ? lp(leg.l) : "—"}</span>
              <span><span className="text-text-tertiary">C</span>{leg ? lp(leg.c) : "—"}</span>
              <span>{leg ? lc(leg.chAbs, leg.chPct) : ""}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: leg ? (leg.up ? "#21C95E" : "#FF622E") : "#787B86" }} />
              <span className="text-text-tertiary">Volume</span>
              <span className="pointer-events-auto flex items-center gap-0.5">{LG({ children: EyeIcon })}{LG({ children: <path fill="currentColor" fillRule="evenodd" d="m3.1 9 2.28-5h7.24l2.28 5-2.28 5H5.38L3.1 9Zm1.63-6h8.54L16 9l-2.73 6H4.73L2 9l2.73-6Zm5.77 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm1 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" /> })}{LG({ children: MoreIcon })}</span>
              <span className={col}>{leg ? lv(leg.vol) : "—"}</span>
            </div>
          </div>

          {/* hover control bar (zoom / scroll / reset) */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-bg-tertiary bg-bg-secondary/90 p-1 opacity-0 shadow-lg backdrop-blur transition group-hover:pointer-events-auto group-hover:opacity-100">
            <Ctrl title="Zoom out" onClick={() => chart.current?.zoom(1 / 1.3)}><path fill="currentColor" d="M14 10H4V8.5h10V10Z" /></Ctrl>
            <Ctrl title="Zoom in" onClick={() => chart.current?.zoom(1.3)}><path fill="currentColor" d="M8.25 13.75v-9.5h1.5v9.5h-1.5Z" /><path fill="currentColor" d="M13.75 9.75h-9.5v-1.5h9.5v1.5Z" /></Ctrl>
            <Ctrl title="Scroll left" onClick={() => chart.current?.scroll(-8)}><path fill="currentColor" d="M10.17 3.92 5.72 9l4.45 5.08 1.13-1L7.71 9l3.6-4.09-1.14-.99Z" /></Ctrl>
            <Ctrl title="Scroll right" onClick={() => chart.current?.scroll(8)}><path fill="currentColor" d="M7.83 3.92 12.28 9l-4.45 5.08-1.13-1L10.29 9l-3.6-4.09 1.14-.99Z" /></Ctrl>
            <Ctrl title="Reset view" onClick={() => chart.current?.fitContent()}><path fill="currentColor" d="M10 6.38V8L6 5.5 10 3v1.85A5.25 5.25 0 1 1 3.75 10a.75.75 0 0 1 1.5 0A3.75 3.75 0 1 0 10 6.38Z" /></Ctrl>
          </div>
        </div>
      </div>

      {/* ===== bottom controls bar ===== */}
      <div className="flex h-[38px] items-center gap-1 border-t border-bg-tertiary px-2">
        <div className="flex items-center gap-0.5">
          {RANGES.map((r) => (
            <BB key={r.label} active={range === r.label} onClick={() => pickRange(r)}>{r.label}</BB>
          ))}
        </div>
        <div className="flex-1" />
        <BB title="Timezone"><span className="tabular-nums">{clock || "--:--:--"} UTC+5:30</span></BB>
        <div className="mx-1 h-4 w-px bg-bg-tertiary" />
        <BB title="Toggle Percentage" active={mode === 2} onClick={() => setMode((m) => (m === 2 ? 0 : 2))}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" aria-hidden="true"><g fill="none" stroke="currentColor"><circle cx="3.5" cy="3.5" r="2" /><circle cx="10.5" cy="10.5" r="2" /><path strokeLinecap="square" d="M9.5 1.5l-5 11" /></g></svg>
        </BB>
        <BB title="Toggle Log Scale" active={mode === 1} onClick={() => setMode((m) => (m === 1 ? 0 : 1))}>log</BB>
        <BB title="Toggle Auto Scale" active={auto} onClick={() => setAuto((v) => !v)}>auto</BB>
      </div>
    </div>
  );
}

function Ctrl({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button type="button" title={title} onClick={onClick} className="flex h-7 w-7 items-center justify-center rounded text-text-secondary hover:bg-bg-tertiary hover:text-text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">{children}</svg>
    </button>
  );
}
