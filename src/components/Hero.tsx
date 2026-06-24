"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { AuthButton } from "./AuthButton";

export function Hero() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    api.trending().then((r) => setLive(r.source === "birdeye")).catch(() => {});
  }, []);

  return (
    <section className="bg-terminal relative overflow-hidden">
      <div className="brand-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        {/* Left: thesis */}
        <div>
          <span className="led inline-flex items-center gap-2 rounded-full border border-ink-500 bg-ink-800 px-3 py-1 text-xs text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chad" />
            {live ? "LIVE · BirdEye on-chain feed" : "Solana · self-custody"}
          </span>

          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-balance sm:text-6xl lg:text-[4.4rem]">
            Find the next
            <br />
            <span className="brand-text-gradient">100x memecoins</span>
            <br />
            before everyone.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            ChadWallet is the fastest way to trade Solana. Buy trending tokens
            24/7, watch top traders move in real time, and never miss the next
            breakout — all self-custody.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/trade"
              className="rounded-xl bg-chad px-6 py-3 font-display font-bold text-ink shadow-glow transition hover:bg-chad-glow"
            >
              Launch the terminal →
            </Link>
            <AuthButton />
          </div>

          <div className="mt-10 flex items-center gap-8">
            <Stat label="Trades / day" value="24/7" />
            <div className="h-8 w-px bg-ink-500" />
            <Stat label="Median swap" value="0.4s" />
            <div className="h-8 w-px bg-ink-500" />
            <Stat label="Custody" value="Yours" />
          </div>
        </div>

        {/* Right: real app screenshots */}
        <div className="relative mx-auto flex h-[520px] w-full max-w-md items-center justify-center">
          <div className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-chad/10 blur-3xl" />
          {/* back phone */}
          <div className="absolute left-[8%] top-6 hidden w-[210px] rotate-[-7deg] sm:block">
            <PhoneShot src="/shots/discover.png" alt="ChadWallet discover feed" />
          </div>
          {/* front phone */}
          <div className="animate-floaty absolute right-[6%] top-0 w-[238px] rotate-[4deg]">
            <PhoneShot src="/shots/token.png" alt="ChadWallet trading screen" priority />
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneShot({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border-4 border-ink-600 bg-ink-900 shadow-panel ring-1 ring-white/5">
      <Image
        src={src}
        alt={alt}
        width={720}
        height={1558}
        priority={priority}
        className="h-auto w-full"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-bone">{value}</p>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
