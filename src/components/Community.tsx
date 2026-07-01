"use client";

import React from "react";
import Image from "next/image";
import { StartTradingButton } from "@/components/AuthButton";

const ANDROID = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

export function Community() {
  return (
    <section className="community relative flex aspect-square flex-col items-center justify-center overflow-hidden">
      {/* blurred-crowd purple backdrop — drop the image at public/images/landing/community-bg.webp */}
      <Image
        src="/images/landing/community-bg.webp"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover"
      />

      {/* rotating orbit rings — inner spins reverse, outer spins forward.
          Drop the transparent PNGs at public/images/landing/{inner,outer}-circle.webp */}
      <img
        loading="lazy"
        alt=""
        src="/images/landing/inner-circle.webp"
        className="animate-spin-inner pointer-events-none absolute inset-0 z-[1] m-auto w-[35vw] sm:w-[30vw]"
      />
      <img
        loading="lazy"
        alt=""
        src="/images/landing/outer-circle.webp"
        className="animate-spin-outer pointer-events-none absolute inset-0 z-[1] m-auto w-screen sm:w-[55vw] sm:max-w-[1100px]"
      />

      {/* centered content */}
      <div className="relative z-10 flex w-[70vw] flex-col items-center gap-3 sm:gap-6">
        <h2 className="text-center font-display text-[40px] font-bold leading-10 tracking-tighter text-bone sm:text-[60px] sm:leading-[60px]">
          a trading app
          <br />
          for the rest of us
        </h2>
        <p className="text-center tracking-tight text-muted sm:text-[22px] sm:leading-7">
          join 500,000 traders making their name on ChadWallet
        </p>

        {/* same buttons as the hero */}
        <div className="pt-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
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
        </div>
      </div>
    </section>
  );
}
