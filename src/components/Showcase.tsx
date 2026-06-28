"use client";

import React from "react";
import Image from "next/image";

function Phone({
  src,
  className = "",
  width = 260,
}: {
  src: string;
  className?: string;
  width?: number;
}) {
  return (
    <div
      className={`relative shrink-0 rounded-[2.3rem] border-[10px] border-[#15161c] bg-black shadow-2xl ring-1 ring-white/10 ${className}`}
      style={{ width }}
    >
      {/* notch */}
      <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[1.7rem]">
        <Image src={src} alt="" width={720} height={1558} className="h-auto w-full" />
      </div>
    </div>
  );
}

export function Showcase() {
  return (
    <section className="relative overflow-hidden border-t border-ink-600 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* copy + video */}
          <div>
            <p className="kicker text-xs text-chad">Now available on web</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              trade from anywhere.
              <br />
              never lose a beat.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Open a trade on your phone, close it on your desktop — all in one
              app, always in sync.
            </p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-ink-600 bg-black shadow-panel">
              <video className="h-auto w-full" src="/brand/chadwallet.mp4" autoPlay muted loop playsInline controls />
            </div>
          </div>

          {/* phone mockup cluster */}
          <div className="relative flex min-h-[460px] items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-chad/15 blur-3xl" />
            <Phone src="/shots/discover.png" width={200} className="relative z-10 -mr-16 -rotate-[10deg] translate-y-6 opacity-90" />
            <Phone src="/shots/token.png" width={250} className="relative z-20" />
            <Phone src="/shots/portfolio.png" width={200} className="relative z-10 -ml-16 rotate-[10deg] translate-y-6 opacity-90" />
          </div>
        </div>

        {/* feature captions */}
        <div className="mt-14 grid gap-4 text-center sm:grid-cols-3">
          {[
            ["Fast trading in seconds", "One-tap buys & sells on Solana"],
            ["Follow top traders live", "Copy the wallets that win"],
            ["Track your whole portfolio", "PnL, positions & history in one place"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-ink-600 bg-ink-800/60 p-5">
              <p className="font-display font-bold text-bone">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
