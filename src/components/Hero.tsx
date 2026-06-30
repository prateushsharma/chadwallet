"use client";

import React from "react";
import Image from "next/image";
import { StartTradingButton } from "@/components/AuthButton";

const ANDROID = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

export function Hero() {
  return (
    <section className="space min-h-[100svh] pt-28 sm:pt-32">
      {/* real Earth/space backdrop — add public/brand/earth.jpg */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/brand/earth.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      {/* legibility overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6">
        <h1 className="giant-wordmark mt-6 text-6xl sm:text-8xl lg:text-9xl">ChadWallet</h1>

        <p className="mt-5 font-display text-2xl font-bold text-bone sm:text-4xl">where chads become legends.</p>
        <p className="mt-3 max-w-xl text-base text-muted sm:text-lg">
          From memecoins to viral tokens, trade any token on Solana in seconds.
        </p>

        {/* buttons sit ABOVE the astronaut (z-20) so the satellite tucks behind */}
        <div className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-3">
          <StartTradingButton className="group flex w-52 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#606AF780] py-3 text-lg font-bold text-white backdrop-blur-md transition-colors duration-150 hover:bg-[#606AF7CC]">
            <span>Start trading</span>
            <span className="flex w-0 items-center overflow-hidden opacity-0 transition-all duration-150 ease-out group-hover:w-7 group-hover:opacity-100">
              <svg viewBox="0 0 24 24" className="ml-2 h-5 w-5 shrink-0 fill-none stroke-current" strokeWidth="2.2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </StartTradingButton>

          <a
            href={ANDROID}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass group flex w-52 items-center justify-center overflow-hidden rounded-xl py-3 text-lg font-bold text-bone transition"
          >
            <span className="flex w-0 items-center overflow-hidden opacity-0 transition-all duration-150 ease-out group-hover:w-7 group-hover:opacity-100">
              <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5 shrink-0 fill-none stroke-current" strokeWidth="2.2">
                <path d="M12 3v12m0 0l-5-5m5 5l5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>Download app</span>
          </a>
        </div>

        {/* astronaut pulled UP behind the buttons (z-10 < buttons z-20) */}
        <div className="relative z-10 -mt-16 w-full max-w-[620px] sm:-mt-24">
          <Image
            src="/brand/astronaut.webp"
            alt=""
            width={1200}
            height={1326}
            priority
            className="animate-floaty h-auto w-full object-contain"
          />
        </div>

        <p className="kicker relative z-10 -mt-10 pb-10 text-xs text-chad">Now available on web</p>
      </div>
    </section>
  );
}
