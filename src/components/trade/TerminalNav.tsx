"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";
import { Token } from "@/lib/types";
import { fmtUsd, fmtPct } from "@/lib/format";
import { AuthButton } from "@/components/AuthButton";
import { LiveBadge } from "./LiveBadge";

export function TerminalNav() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.trending().then((r) => setTokens(r.tokens ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        (boxRef.current?.querySelector("input") as HTMLInputElement)?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const filtered = q
    ? tokens.filter((t) =>
        t.symbol.toLowerCase().includes(q.toLowerCase()) ||
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        t.address.toLowerCase().includes(q.toLowerCase())
      )
    : tokens;
  const rows = filtered.slice(0, 7);

  function go(addr: string) {
    setQ(""); setOpen(false);
    router.push(`/trade?token=${addr}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink-900/90 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4">
        <Link href="/" aria-label="ChadWallet home"><Logo size={26} /></Link>

        <div ref={boxRef} className="relative mx-auto w-full max-w-xl">
          <div className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-3 py-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-muted" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Search for tokens or traders..."
              className="w-full bg-transparent text-sm text-bone outline-none placeholder:text-muted"
            />
            <span className="led rounded-md border border-ink-500 px-1.5 py-0.5 text-[10px] text-muted">{q ? "ESC" : "/"}</span>
          </div>

          {open && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-ink-600 bg-ink-800 shadow-panel">
              <p className="led px-4 py-2 text-[11px] uppercase tracking-wide text-muted">
                {q ? "Results" : "Trending tokens"}
              </p>
              <div className="scroll-thin max-h-[60vh] overflow-y-auto">
                {rows.map((t) => {
                  const up = t.priceChange24h >= 0;
                  return (
                    <button key={t.address} onClick={() => go(t.address)}
                      className="grid w-full grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-4 py-2.5 text-left hover:bg-ink-700">
                      <span className="relative shrink-0">
                        {t.logoURI ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.logoURI} alt="" className="h-8 w-8 rounded-full bg-ink-600 object-cover" />
                        ) : <span className="block h-8 w-8 rounded-full bg-ink-600" />}
                        <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-brandblue text-[8px] font-bold text-white ring-2 ring-ink-800">✓</span>
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-display text-sm font-bold text-bone">{t.symbol}</p>
                          <RowIcons />
                        </div>
                        <p className="truncate text-xs text-muted">{t.name}</p>
                      </div>
                      <Metric label="MC" value={fmtUsd(t.marketCap, { compact: true })} />
                      <div className="text-right">
                        <p className="led text-sm text-bone">{fmtUsd(t.price)}</p>
                        <p className={`led text-xs font-bold ${up ? "text-mint" : "text-ember"}`}>{fmtPct(t.priceChange24h)}</p>
                      </div>
                      <Metric label="VOL" value={fmtUsd(t.volume24h, { compact: true })} />
                    </button>
                  );
                })}
                {rows.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">No matches.</p>}
              </div>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          <LiveBadge />
          <div className="text-right">
            <p className="led text-sm font-bold text-bone">$0.00 <span className="text-muted">cash</span></p>
            <button className="text-xs font-bold text-chad hover:underline">Deposit more</button>
          </div>
          <div className="text-right">
            <p className="led text-sm font-bold text-bone">$0.00</p>
            <p className="led text-xs text-muted">--</p>
          </div>
          <AuthButton compact />
        </div>
      </div>
    </header>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="hidden text-right sm:block">
      <p className="text-[10px] uppercase text-muted">{label}</p>
      <p className="led text-xs text-bone">{value}</p>
    </div>
  );
}

const ROW_ICONS = [
  "M4 6h16M4 12h16M4 18h16",       // list
  "M4 4l16 16M20 4L4 20",          // X
  "M12 3l2.9 6 6.1.8-4.5 4.3 1.2 6.1L12 17.8 6.3 20.2l1.2-6.1L3 9.8 9.1 9z", // star
];
function RowIcons() {
  return (
    <span className="flex items-center gap-0.5 text-muted">
      {ROW_ICONS.map((d, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth="2">
          <path d={d} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}
