"use client";

import React from "react";
import Link from "next/link";

const ANDROID = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

export function Community() {
  return (
    <section className="community relative overflow-hidden border-t border-ink-600">
      <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6">
        {/* orbiting brand orbs */}
        <Orbs />

        <h2 className="relative font-display text-4xl font-extrabold leading-tight tracking-tight text-balance sm:text-6xl">
          a trading app for
          <br />
          the rest of us.
        </h2>
        <p className="relative mx-auto mt-5 max-w-md text-lg text-muted">
          Join 500,000+ traders making their name on ChadWallet.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/trade"
            className="rounded-xl bg-chad px-7 py-3.5 font-display font-bold text-ink shadow-glow transition hover:bg-chad-glow"
          >
            Start trading
          </Link>
          <a
            href={ANDROID}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass rounded-xl px-7 py-3.5 font-display font-bold text-bone transition"
          >
            Download app
          </a>
        </div>
      </div>
    </section>
  );
}

function Orbs() {
  const orbs = [
    { r: 220, dur: 28, size: 44, grad: "from-chad to-mint", top: "30%", left: "50%" },
    { r: 300, dur: 38, size: 36, grad: "from-brandblue to-brandteal", top: "30%", left: "50%" },
    { r: 180, dur: 22, size: 30, grad: "from-brandmint to-brandblue", top: "55%", left: "50%" },
    { r: 340, dur: 44, size: 52, grad: "from-gold to-chad", top: "55%", left: "50%" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {orbs.map((o, i) => (
        <span
          key={i}
          className="orb absolute"
          style={{
            top: o.top,
            left: o.left,
            ["--r" as any]: `${o.r}px`,
            ["--dur" as any]: `${o.dur}s`,
          }}
        >
          <span
            className={`block rounded-2xl bg-gradient-to-br ${o.grad} opacity-40 blur-[1px]`}
            style={{ width: o.size, height: o.size }}
          />
        </span>
      ))}
    </div>
  );
}
