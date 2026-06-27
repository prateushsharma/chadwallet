"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Token } from "@/lib/types";
import { RichHolder, genTraderTxs, TraderTx } from "@/lib/feed";
import { fmtUsd, fmtNum, fmtPct, shortAddr } from "@/lib/format";

interface Ctx { open: (holder: RichHolder, token: Token) => void; }
const TraderCtx = createContext<Ctx>({ open: () => {} });
export const useTrader = () => useContext(TraderCtx);

export function TraderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ holder: RichHolder; token: Token } | null>(null);
  return (
    <TraderCtx.Provider value={{ open: (holder, token) => setState({ holder, token }) }}>
      {children}
      {state && <TraderModal holder={state.holder} token={state.token} onClose={() => setState(null)} />}
    </TraderCtx.Provider>
  );
}

function TraderModal({ holder, token, onClose }: { holder: RichHolder; token: Token; onClose: () => void }) {
  const txs = genTraderTxs(holder.name + holder.rank, token, 30);
  const up = holder.pnlUsd >= 0;
  const invested = holder.positionUsd - holder.pnlUsd;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-16" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-ink-500 bg-ink-800 shadow-panel" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center gap-3 border-b border-ink-600 px-5 py-3">
          <span className="h-9 w-9 rounded-full" style={{ background: `hsl(${holder.hue} 60% 45%)` }} />
          <p className="font-display text-base font-bold text-bone">{holder.name} <span className="text-muted">›</span></p>
          <div className="ml-auto flex items-center gap-2">
            <button className="led flex items-center gap-1.5 rounded-lg border border-ink-500 px-3 py-1.5 text-sm text-bone hover:bg-ink-700">↗ Share</button>
            <button className="rounded-lg bg-brandblue px-4 py-1.5 text-sm font-bold text-white hover:brightness-110">Follow</button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-ink-700 hover:text-bone">✕</button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto scroll-thin lg:grid-cols-[1fr_360px]">
          {/* LEFT: token identity + chart + thesis */}
          <div className="border-b border-ink-600 p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2">
              {token.logoURI ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={token.logoURI} alt="" className="h-9 w-9 rounded-full bg-ink-600 object-cover" />
              ) : <span className="h-9 w-9 rounded-full bg-ink-600" />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-bold text-bone">{token.name}</p>
                  <button onClick={() => navigator.clipboard?.writeText(token.address)} className="led text-xs text-muted hover:text-chad">{shortAddr(token.address, 4)} ⧉</button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="led flex items-center gap-1 rounded bg-mint/15 px-1.5 py-0.5 text-[10px] font-bold text-mint"><span className="h-1 w-1 rounded-full bg-mint" /> Open</span>
                  <span className="flex items-center gap-0.5 text-muted">
                    {["M4 6h16M4 12h16M4 18h16", "M4 4l16 16M20 4L4 20", "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4-4", "M12 3l2.9 6 6.1.8-4.5 4.3 1.2 6.1L12 17.8 6.3 20.2l1.2-6.1L3 9.8 9.1 9z"].map((d, i) => (
                      <svg key={i} viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth="2"><path d={d} strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ))}
                  </span>
                </div>
              </div>
              <div className="ml-auto text-right">
                <p className="led text-sm font-bold text-bone">{fmtUsd(token.marketCap, { compact: true })} MC</p>
                <p className={`led text-xs ${token.priceChange24h >= 0 ? "text-mint" : "text-ember"}`}>{fmtPct(token.priceChange24h)}</p>
              </div>
            </div>

            <MiniChart address={token.address} txs={txs} />

            {/* thesis posts */}
            <div className="mt-4 space-y-3">
              {holder.thesis && (
                <Post name={holder.name} hue={holder.hue} tag="Thesis" age="1m" body={holder.thesis} likes={holder.thesisLikes} />
              )}
              <Post name={holder.name} hue={holder.hue} age="17h" body="Genuinely hope this one runs. Conviction stays max until thesis breaks." likes={0} />
            </div>
          </div>

          {/* RIGHT: buy/sell + position + transactions */}
          <div className="flex min-h-0 flex-col p-5">
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-xl bg-mint py-3 font-display font-bold text-ink hover:brightness-110">Buy</button>
              <button className="rounded-xl bg-ember py-3 font-display font-bold text-ink hover:brightness-110">Sell</button>
            </div>

            <div className="mt-4 rounded-xl border border-ink-600 bg-ink-900 p-4">
              <div className="flex items-baseline justify-between">
                <span className="led text-xl font-bold text-bone">{fmtUsd(holder.positionUsd)}</span>
                <span className={`led text-sm font-bold ${up ? "text-mint" : "text-ember"}`}>{up ? "+" : ""}{fmtUsd(holder.pnlUsd)}</span>
              </div>
              <div className="led mt-1 flex items-center justify-between text-xs">
                <span className="text-muted">{fmtNum(holder.tokenAmount)} {token.symbol}</span>
                <span className={up ? "text-mint" : "text-ember"}>{fmtPct(holder.pnlPct)}</span>
              </div>
              <div className="led mt-3 flex items-center justify-between border-t border-ink-700 pt-3 text-xs">
                <span className="text-muted">Avg. entry <span className="text-bone">{fmtUsd(holder.avgEntryMc, { compact: true })} MC</span></span>
                <span className="text-muted">Invested <span className="text-bone">{fmtUsd(invested)}</span></span>
              </div>
            </div>

            <p className="led mt-4 mb-1 text-[11px] uppercase tracking-wide text-muted">Transactions ({txs.length})</p>
            <div className="scroll-thin -mx-1 flex-1 overflow-y-auto px-1">
              {txs.map((t, i) => (
                <div key={i} className="led flex items-center justify-between border-b border-ink-700/60 py-2 text-xs">
                  <span className={`rounded px-1.5 py-0.5 font-bold ${t.side === "buy" ? "bg-mint/15 text-mint" : "bg-ember/15 text-ember"}`}>{t.side === "buy" ? "Buy" : "Sell"}</span>
                  <span className="text-bone">{fmtUsd(t.amountUsd)} at {fmtUsd(t.mc, { compact: true })} MC</span>
                  <span className="text-muted">{new Date(t.time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted">PnL, entry &amp; tx history are estimated — per-wallet history needs a paid data tier.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Post({ name, hue, tag, age, body, likes }: { name: string; hue: number; tag?: string; age: string; body: string; likes: number }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 h-7 w-7 shrink-0 rounded-full" style={{ background: `hsl(${hue} 60% 45%)` }} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-bone">{name}</span>
          {tag && <span className="rounded bg-brandblue/15 px-1.5 py-0.5 text-[10px] text-brandblue">{tag}</span>}
          <span className="text-muted">{age}</span>
        </div>
        <p className="mt-1 text-sm text-bone">{body}</p>
        <p className="led mt-1 text-[11px] text-muted">♡ {likes}</p>
      </div>
    </div>
  );
}

function MiniChart({ address, txs }: { address: string; txs: TraderTx[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tf, setTf] = useState("1H");
  const TF = ["LIVE", "1H", "4H", "1D", "ALL"];
  const tfMap: Record<string, string> = { LIVE: "1m", "1H": "1H", "4H": "4H", "1D": "1D", ALL: "1D" };

  useEffect(() => {
    let chart: any, disposed = false, ro: ResizeObserver | undefined;
    (async () => {
      const { createChart, ColorType, CrosshairMode } = await import("lightweight-charts");
      if (disposed || !ref.current) return;
      let candles: any[] = [];
      try { candles = (await api.candles(address, tfMap[tf])).candles ?? []; } catch {}
      if (disposed || !ref.current || !candles.length) return;
      chart = createChart(ref.current, {
        layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#888B96", fontFamily: "var(--font-mono), monospace" },
        grid: { vertLines: { color: "rgba(255,255,255,0.03)" }, horzLines: { color: "rgba(255,255,255,0.03)" } },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: "#20212A" },
        timeScale: { borderColor: "#20212A", timeVisible: true, secondsVisible: false },
        height: 220, width: ref.current.clientWidth,
      });
      const series = chart.addCandlestickSeries({
        upColor: "#26ED80", downColor: "#FF5C5C", borderUpColor: "#26ED80", borderDownColor: "#FF5C5C",
        wickUpColor: "#26ED80", wickDownColor: "#FF5C5C", priceFormat: { type: "price", precision: 8, minMove: 0.00000001 },
      });
      series.setData(candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));

      // place this trader's buy/sell markers at the nearest candle
      const times = candles.map((c) => c.time);
      const markers = txs.slice(0, 12).map((t) => {
        const ts = Math.floor(t.time / 1000);
        let nearest = times[0], best = Infinity;
        for (const tm of times) { const d = Math.abs(tm - ts); if (d < best) { best = d; nearest = tm; } }
        return {
          time: nearest as any,
          position: t.side === "buy" ? "belowBar" : "aboveBar",
          color: t.side === "buy" ? "#26ED80" : "#FF5C5C",
          shape: "circle",
          text: t.side === "buy" ? "B" : "S",
        };
      }).sort((a, b) => (a.time as number) - (b.time as number));
      series.setMarkers(markers);
      chart.timeScale().fitContent();

      ro = new ResizeObserver(() => ref.current && chart.applyOptions({ width: ref.current.clientWidth }));
      ro.observe(ref.current);
    })();
    return () => { disposed = true; ro?.disconnect(); chart?.remove?.(); };
  }, [address, tf]);

  return (
    <div className="mt-3">
      <div ref={ref} className="h-[220px] w-full rounded-lg border border-ink-700" />
      <div className="mt-2 flex items-center gap-1">
        {TF.map((t) => (
          <button key={t} onClick={() => setTf(t)} className={`led rounded px-2 py-0.5 text-xs ${tf === t ? "bg-ink-600 text-bone" : "text-muted hover:text-bone"}`}>{t}</button>
        ))}
        <span className="ml-auto flex items-center gap-0.5 rounded-md border border-ink-600 p-0.5">
          <span title="Candles" className="rounded bg-ink-600 p-1 text-bone">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M6 7h2v10H6zM11 4h2v16h-2zM16 9h2v6h-2z" /></svg>
          </span>
          <span title="Line" className="rounded p-1 text-muted">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2"><path d="M3 16l5-6 4 3 6-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </span>
      </div>
    </div>
  );
}
