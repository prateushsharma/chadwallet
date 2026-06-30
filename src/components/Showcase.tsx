"use client";

import React from "react";
import Image from "next/image";

export function Showcase() {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        {/* heading */}
        <div className="text-center">
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            trade from anywhere.
            <br />
            never lose a beat.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Open a trade on your phone, close it on your desktop — all in one app, always in sync.
          </p>
        </div>

        {/* device stage */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          {/* ambient glow */}
          <div className="pointer-events-none absolute -inset-x-20 -inset-y-16 -z-10">
            <div className="h-full w-full rounded-[120px] bg-[#3b4ea0]/35 blur-[130px]" />
          </div>
          <div className="pointer-events-none absolute -inset-6 -z-10">
            <div className="h-full w-full rounded-[48px] bg-[#606AF7]/18 blur-[70px]" />
          </div>

          {/* DIRECT trading screenshot — no monitor frame, no stand */}
          <div className="relative overflow-hidden rounded-2xl shadow-[0_50px_150px_-20px_rgba(0,0,0,0.9)]">
            <div className="relative aspect-[16/10]">
              <Image
                src="/shots/terminal.png"
                alt="ChadWallet terminal"
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover object-top"
                priority
              />
            </div>
          </div>

          {/* phone (3D mockup PNG) — anchored to the bottom-right, hangs below the screen like fomo */}
          <div className="absolute -bottom-20 right-4 z-20 animate-floaty sm:-bottom-24 sm:right-12">
            <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#606AF7]/30 blur-3xl" />
            <Image
              src="/shots/phone.png"
              alt="ChadWallet app"
              width={420}
              height={860}
              priority
              className="h-auto w-[170px] drop-shadow-2xl sm:w-[240px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
