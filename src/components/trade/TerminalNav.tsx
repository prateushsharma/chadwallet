"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";
import { Token } from "@/lib/types";
import { AuthButton } from "@/components/AuthButton";

export function TerminalNav() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.trending().then((r) => setTokens(r.tokens ?? [])).catch(() => {});
  }, []);

  const results = q
    ? tokens.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q.toLowerCase()) ||
          t.name.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6)
    : [];

  function go(addr: string) {
    setQ("");
    setOpen(false);
    router.push(`/trade?token=${addr}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink-900/90 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4">
        <Link href="/" aria-label="ChadWallet home">
          <Logo size={26} />
        </Link>

        {/* centered search */}
        <div className="relative mx-auto w-full max-w-xl">
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
            <span className="led rounded-md border border-ink-500 px-1.5 py-0.5 text-[10px] text-muted">/</span>
          </div>
          {open && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-ink-600 bg-ink-800 shadow-panel">
              {results.map((t) => (
                <button
                  key={t.address}
                  onClick={() => go(t.address)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-ink-700"
                >
                  {t.logoURI ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logoURI} alt="" className="h-6 w-6 rounded-full bg-ink-600 object-cover" />
                  ) : (
                    <span className="h-6 w-6 rounded-full bg-ink-600" />
                  )}
                  <span className="font-display text-sm font-bold text-bone">{t.symbol}</span>
                  <span className="truncate text-xs text-muted">{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* cash + deposit + avatar */}
        <div className="hidden items-center gap-4 sm:flex">
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
