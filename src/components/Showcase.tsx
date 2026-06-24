"use client";

import React from "react";
import Image from "next/image";

const SHOTS: { src: string; caption: string }[] = [
  { src: "/shots/token.png", caption: "Fast trading in seconds" },
  { src: "/shots/discover.png", caption: "Follow top traders live" },
  { src: "/shots/search.png", caption: "Search tokens, wallets, tweets" },
  { src: "/shots/portfolio.png", caption: "Track your whole portfolio" },
  { src: "/shots/launch.png", caption: "Launch your own token" },
  { src: "/shots/kol.png", caption: "KOL calls in real time" },
];

export function Showcase() {
  return (
    <section className="relative border-t border-ink-600 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Video */}
          <div>
            <p className="led text-sm uppercase tracking-widest text-chad">
              See it in action
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              The whole market,
              <br />
              in your thumb.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              From spotting a mover to settling a swap — every step lives on one
              screen, built for one hand and a fast thumb.
            </p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-ink-600 bg-black shadow-panel">
              <video
                className="h-auto w-full"
                src="/brand/chadwallet.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            </div>
          </div>

          {/* Screenshot strip */}
          <div className="scroll-thin -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
            {SHOTS.map((s) => (
              <figure
                key={s.src}
                className="snap-center shrink-0"
                style={{ width: 200 }}
              >
                <div className="overflow-hidden rounded-[1.6rem] border-4 border-ink-600 bg-ink-800 ring-1 ring-white/5">
                  <Image
                    src={s.src}
                    alt={s.caption}
                    width={720}
                    height={1558}
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-3 text-center text-sm text-muted">
                  {s.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
