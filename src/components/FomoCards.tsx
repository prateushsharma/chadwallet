"use client";

import React from "react";
import Link from "next/link";

const TRADES = [
  { who: "irulan", handle: "@cortino.iv", amt: "+$685,392.12", up: true },
  { who: "frank", handle: "@frank.sol", amt: "+$2,206,392.46", up: true },
  { who: "lesabre", handle: "sold SOL", amt: "-$41,520.00", up: false },
  { who: "juggin", handle: "@juggrr", amt: "+$849,071.91", up: true },
];

export function FomoCards() {
  return (
    <section className="relative border-t border-ink-600 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* live trades row */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRADES.map((t) => (
            <div
              key={t.who}
              className="flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-800/70 px-4 py-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-chad/40 to-brandblue/40 font-display text-sm font-bold text-bone">
                {t.who[0].toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-bone">{t.who}</p>
                <p className="truncate text-xs text-muted">{t.handle}</p>
              </div>
              <span
                className={`led text-sm font-bold ${t.up ? "text-mint" : "text-ember"}`}
              >
                {t.amt}
              </span>
            </div>
          ))}
        </div>

        {/* feature cards */}
        <div className="grid gap-5 lg:grid-cols-3">
          <Card kicker="Easy onboarding" title="create an account in an instant">
            <div className="mt-auto space-y-3">
              <Link
                href="/trade"
                className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-display font-bold text-black transition hover:brightness-95"
              >
                <AppleIcon /> Sign in with Apple
              </Link>
              <Link
                href="/trade"
                className="flex items-center justify-center gap-2 rounded-xl bg-ink-700 py-3 font-display font-bold text-bone ring-1 ring-ink-500 transition hover:bg-ink-600"
              >
                <GoogleIcon /> Sign in with Google
              </Link>
            </div>
          </Card>

          <Card kicker="Zero complexity" title="fast & gasless on Solana">
            <div className="relative mt-auto grid h-44 place-items-center">
              <div className="absolute h-28 w-28 rotate-12 rounded-2xl bg-gradient-to-br from-brandblue to-brandteal opacity-90 blur-[1px]" />
              <div className="absolute h-24 w-24 -translate-x-12 translate-y-6 -rotate-6 rounded-2xl bg-gradient-to-br from-chad to-mint opacity-80" />
              <div className="absolute h-20 w-20 translate-x-14 translate-y-8 rotate-6 rounded-full bg-gradient-to-br from-brandmint to-brandblue opacity-80" />
            </div>
          </Card>

          <Card kicker="One click to buy" title="fund with apple pay">
            <div className="mt-auto rounded-xl border border-ink-600 bg-ink-800 p-3">
              <div className="led flex items-center justify-between text-bone">
                <span className="text-2xl font-bold">$100</span>
                <span className="text-xs text-muted">balance ready</span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {["$25", "$50", "$100", "$250"].map((q, i) => (
                  <span
                    key={q}
                    className={`led rounded-md py-1.5 text-center text-xs ${
                      i === 2 ? "bg-chad text-ink" : "bg-ink-700 text-muted"
                    }`}
                  >
                    {q}
                  </span>
                ))}
              </div>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 font-display font-bold text-black">
                <AppleIcon /> Buy with Pay
              </button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[360px] flex-col rounded-2xl border border-ink-600 bg-ink-800/60 p-6">
      <p className="kicker text-[11px] text-chad">{kicker}</p>
      <h3 className="mt-2 font-display text-2xl font-bold text-bone">{title}</h3>
      {children}
    </div>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M16.36 1.43c0 1.14-.42 2.2-1.25 3.04-.99 1-2.13 1.58-3.37 1.48-.15-1.1.4-2.27 1.16-3.03.85-.86 2.3-1.5 3.46-1.49zM20.5 17.2c-.55 1.27-.82 1.84-1.53 2.96-.99 1.57-2.39 3.52-4.12 3.53-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.01-3.06-1.77-4.05-3.34C-.07 15.95-.36 10.8 1.4 8.06c1.25-1.94 3.22-3.08 5.07-3.08 1.89 0 3.07 1.04 4.63 1.04 1.51 0 2.43-1.04 4.62-1.04 1.65 0 3.4.9 4.64 2.46-4.08 2.24-3.42 8.07.14 9.76z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1A6.2 6.2 0 1 1 16.1 7l2.7-2.6A10 10 0 1 0 22 12c0-.7-.07-1.2-.17-1.8z" />
    </svg>
  );
}
