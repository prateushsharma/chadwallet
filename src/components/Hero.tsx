"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const ANDROID = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

export function Hero() {
  return (
    <section className="space min-h-[100svh] pt-28 sm:pt-32">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6">
        <h1 className="giant-wordmark mt-6 text-6xl sm:text-8xl lg:text-9xl">
          ChadWallet
        </h1>

        <p className="mt-5 font-display text-2xl font-bold text-bone sm:text-4xl">
          where chads become legends.
        </p>
        <p className="mt-3 max-w-xl text-base text-muted sm:text-lg">
          From memecoins to viral tokens, trade any token on Solana in seconds.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

        {/* floating brand mark (stands in for fomo's astronaut) */}
        <div className="relative mt-10 h-56 w-56 sm:h-72 sm:w-72">
          <div className="absolute inset-0 rounded-full bg-chad/10 blur-3xl" />
          <Image
            src="/brand/chad-head.png"
            alt=""
            width={288}
            height={288}
            priority
            className="animate-floaty relative h-full w-full object-contain drop-shadow-[0_20px_60px_rgba(38,237,128,0.25)]"
          />
        </div>

        <p className="kicker mt-8 pb-10 text-xs text-chad">Now available on web</p>
      </div>
    </section>
  );
}
