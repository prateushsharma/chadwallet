"use client";

import React from "react";
import { StartTradingButton } from "@/components/AuthButton";

const ANDROID = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

export function Community() {
  return (
    <section className="relative flex items-center justify-center self-stretch py-40 sm:py-0">
      {/* full-brightness crowd photo — the darkness comes from the image itself + the edge fades */}
      <img
        loading="lazy"
        alt=""
        src="/images/landing/legends.webp"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* top + bottom gradient strips fade the photo into the page background */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="w-[80vw] px-8">
        <div className="relative flex aspect-square flex-col items-center justify-center">
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
              {/* mobile: download only */}
              <div className="flex gap-2 sm:hidden">
                <a
                  href={ANDROID}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="z-[2] w-[200px] rounded-xl border border-ink-600 bg-white/12 py-3 text-center text-lg font-bold text-bone backdrop-blur-md"
                >
                  Download app
                </a>
              </div>

              {/* desktop: start trading + download */}
              <div className="hidden gap-3 sm:flex">
                <StartTradingButton className="group z-[2] flex w-[200px] items-center justify-center overflow-hidden rounded-xl border border-ink-600 bg-[#606AF780] py-3 text-lg font-bold text-white backdrop-blur-md transition-colors duration-150 hover:bg-[#606AF7CC]">
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
                  className="group z-[2] flex w-[200px] items-center justify-center overflow-hidden rounded-xl border border-ink-600 bg-white/12 py-3 text-lg font-bold text-bone backdrop-blur-md transition-colors duration-150 hover:bg-white/20"
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

          {/* rotating rings */}
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
        </div>
      </div>
    </section>
  );
}
