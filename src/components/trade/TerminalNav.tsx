"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";
import { Token } from "@/lib/types";
import { fmtUsd } from "@/lib/format";

// fomo compact: $44B, $168.3M, $716K
function short(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  const t = (x: number) => x.toFixed(1).replace(/\.0$/, "");
  if (n >= 1e9) return `$${t(n / 1e9)}B`;
  if (n >= 1e6) return `$${t(n / 1e6)}M`;
  if (n >= 1e3) return `$${t(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}
const addrShort = (a: string) => (a && a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-6)}` : a);

export function TerminalNav() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const filtered = q
    ? tokens.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q.toLowerCase()) ||
          t.name.toLowerCase().includes(q.toLowerCase()) ||
          t.address.toLowerCase().includes(q.toLowerCase())
      )
    : tokens;
  const rows = filtered.slice(0, 8);

  function go(addr: string) {
    setQ("");
    setOpen(false);
    router.push(`/trade?token=${addr}`);
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setQ(text.trim());
        setOpen(true);
        inputRef.current?.focus();
      }
    } catch {
      inputRef.current?.focus();
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-bg-tertiary bg-bg-primary/90 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4">
        {/* left: logo */}
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <Link href="/" aria-label="ChadWallet home">
            <Logo size={26} />
          </Link>
        </div>

        {/* center: search */}
        <div className="relative mt-1 h-12 w-100 min-w-80 large-desktop:w-160">
          <div ref={boxRef} className="absolute left-1/2 top-0 z-modal flex w-100 -translate-x-1/2 flex-col large-desktop:w-160">
            <div className="relative">
              <div className="relative z-10 flex flex-col">
                <div
                  onClick={() => { setOpen(true); inputRef.current?.focus(); }}
                  className="flex h-12 cursor-text items-center gap-2 rounded-xl border border-bg-tertiary bg-bg-primary px-3 hover:bg-bg-secondary"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 text-text-tertiary"><use href="/images/sprite.svg#search" /></svg>
                      <input
                        ref={inputRef}
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        className="h-full min-w-0 flex-1 bg-transparent text-sm font-normal leading-none text-text-primary outline-none placeholder:text-text-tertiary"
                        placeholder="Search for tokens or traders..."
                      />
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); paste(); }}
                      className="cursor-pointer rounded-sm bg-bg-tertiary px-1.5 py-0.5 text-[10px] font-bold text-text-secondary hover:text-text-primary"
                    >
                      Paste
                    </button>
                    <div className="min-w-5 rounded-sm bg-bg-tertiary px-1.5 py-0.5 text-center text-[10px] font-bold text-text-secondary">/</div>
                  </div>
                </div>

                {/* dropdown */}
                <div className={`overflow-hidden transition-[max-height,opacity] duration-150 ease-out ${open ? "max-h-110 opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}>
                  <div>
                    <div className="flex max-h-110 min-h-70 flex-col overflow-y-auto">
                      <div className="flex h-9 shrink-0 items-center justify-between px-2 text-sm text-text-secondary">
                        {q ? "Results" : "Recents"}
                        <button type="button" onClick={() => setQ("")} className="text-xs font-bold text-accent-primary hover:opacity-80">
                          Clear all
                        </button>
                      </div>
                      {rows.map((t) => {
                        const up = t.priceChange24h >= 0;
                        const c = up ? "rgb(33, 201, 94)" : "rgb(255, 98, 46)";
                        return (
                          <button
                            key={t.address}
                            onClick={() => go(t.address)}
                            className="block rounded-lg tabular-nums hover:bg-bg-tertiary/60 focus:bg-bg-tertiary/60 focus:outline-none"
                          >
                            <div className="flex shrink-0 items-center gap-3 px-2 py-2 tabular-nums">
                              <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
                                {t.logoURI ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img style={{ height: 36, width: 36 }} className="rounded-full border border-bg-tertiary object-cover" src={t.logoURI} alt="" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
                                ) : (
                                  <span className="block rounded-full border border-bg-tertiary bg-bg-tertiary" style={{ height: 36, width: 36 }} />
                                )}
                                <div className="absolute flex items-center justify-center" style={{ bottom: -3, right: -3 }}>
                                  <svg style={{ width: 16, height: 16 }}><use href="/images/sprite.svg#badge-check" /></svg>
                                </div>
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm">{t.symbol}</span>
                                  <svg width="16" height="16" className="text-text-secondary"><use href="/images/sprite.svg#solana-logo" /></svg>
                                  <span className="flex items-center justify-center overflow-hidden rounded-sm bg-bg-tertiary p-0.5 text-text-secondary hover:text-text-primary">
                                    <svg width="12" height="12"><use href="/images/sprite.svg#twitter-logo" /></svg>
                                  </span>
                                  <span>
                                    <svg className="size-3.5 text-text-tertiary hover:text-text-primary"><use href="/images/sprite.svg#star-empty" /></svg>
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-text-secondary">
                                  <span className="max-w-24 truncate">{t.name}</span>
                                  <span className="hidden text-xs text-text-tertiary large-desktop:block">{addrShort(t.address)}</span>
                                </div>
                              </div>
                              <div className="hidden w-22 shrink-0 items-center gap-1.5 text-xs large-desktop:flex">
                                <div className="rounded-sm border border-bg-tertiary px-1 py-px text-[10px] font-bold text-text-tertiary">MC</div>
                                <div>{short(t.marketCap)}</div>
                              </div>
                              <div className="w-18 shrink-0 text-xs">
                                <span className="tabular-nums">{fmtUsd(t.price)}</span>
                              </div>
                              <div className="w-14 shrink-0">
                                <div className="flex items-center gap-0.75" style={{ lineHeight: "16px" }}>
                                  <div style={{ color: c, fontWeight: 400, fontSize: "6px" }}>{up ? "▲" : "▼"}</div>
                                  <div style={{ fontSize: "12px", fontWeight: 500, color: c }}>{Math.abs(t.priceChange24h).toFixed(2)}%</div>
                                </div>
                              </div>
                              <div className="hidden w-22 shrink-0 items-center gap-1.5 text-xs large-desktop:flex">
                                <div className="rounded-sm border border-bg-tertiary px-1 py-px text-[10px] font-bold text-text-tertiary">VOL</div>
                                <div>{short(t.volume24h)}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {rows.length === 0 && <p className="px-2 py-6 text-center text-sm text-text-tertiary">No matches.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* right: nav */}
        <div className="flex min-w-0 flex-1 justify-end">
          <nav className="relative flex max-w-max flex-1 items-center justify-center">
            <div style={{ position: "relative" }}>
              <ul className="flex flex-1 list-none items-stretch justify-center gap-2">
                {/* cash */}
                <li className="relative flex h-12 shrink-0 flex-col items-center justify-center rounded-xl border border-bg-tertiary px-2">
                  <button className="inline-flex items-center justify-center text-sm outline-none focus:opacity-80">
                    <div className="flex items-baseline gap-1 tabular-nums">
                      <span>$0.00</span>
                      <div className="text-text-tertiary">cash</div>
                    </div>
                  </button>
                  <button type="button" className="text-xs font-bold text-accent-primary hover:opacity-80">Deposit more</button>
                </li>
                {/* profile */}
                <li className="relative flex h-12 shrink-0 rounded-xl border border-bg-tertiary bg-bg-primary px-2 py-1 hover:bg-bg-secondary">
                  <button className="inline-flex items-center justify-center outline-none">
                    <div className="flex min-w-26 items-center gap-2">
                      <div className="flex flex-1 flex-col">
                        <div className="text-left text-sm tabular-nums">
                          <span>$0.00</span>
                        </div>
                        <div className="flex items-center gap-1 tabular-nums">
                          <div className="flex items-center gap-0.5" style={{ lineHeight: "16px" }}>
                            <div style={{ fontSize: "12px", fontWeight: 500, color: "rgb(152, 153, 163)" }}>--</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-center rounded-full" style={{ height: 32, width: 32, backgroundColor: "rgb(115, 204, 255)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                          <ellipse cx="8.6" cy="11" rx="2" ry="3" fill="#0b0b12" />
                          <ellipse cx="15.4" cy="11" rx="2" ry="3" fill="#0b0b12" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
