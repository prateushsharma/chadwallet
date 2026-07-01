"use client";

import React from "react";
import Image from "next/image";

type Card = { kicker: string; heading: string; img: string };

const CARDS: Card[] = [
  { kicker: "LEADERBOARD", heading: "become a legend, top the leaderboard", img: "/images/feat-leaderboard.png" },
  { kicker: "FEED", heading: "discover and follow top traders", img: "/images/feat-feed.png" },
  { kicker: "ALERTS", heading: "real time notifications for what the best are buying", img: "/images/feat-alerts.png" },
  { kicker: "EASY ONBOARDING", heading: "create an account in an instant", img: "/images/feat-onboarding.png" },
  { kicker: "ZERO COMPLEXITY", heading: "multichain & gasless", img: "/images/feat-multichain.png" },
  { kicker: "ONE CLICK TO BUY", heading: "fund with apple pay", img: "/images/feat-applepay.png" },
];

export function FomoCards() {
  return (
    <section className="relative bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          never miss out again
        </h2>
        <p className="mt-3 text-lg text-muted">the only social-first trading app</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <article
              key={c.kicker}
              className="group flex aspect-square flex-col gap-2 overflow-hidden rounded-[25px] border border-ink-600 bg-ink-800 pb-0 pt-8 transition-colors duration-300 hover:border-white/[0.12]"
            >
              <div className="px-8 font-mono font-bold text-[#606AF7]">{c.kicker}</div>
              <h3 className="px-8 font-display text-[28px] font-bold leading-8 tracking-tight text-bone sm:text-[36px] sm:leading-10">
                {c.heading}
              </h3>
              <div className="relative min-h-0 flex-1">
                <Image
                  src={c.img}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
