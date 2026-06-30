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
            <div className="h-full w-full rounded-[110px] bg-[#3b4ea0]/35 blur-[130px]" />
          </div>
          <div className="pointer-events-none absolute -inset-6 -z-10">
            <div className="h-full w-full rounded-[48px] bg-[#606AF7]/18 blur-[70px]" />
          </div>

          {/* monitor — screenshot only, NO bezel frame (kills the inner line) */}
          <div className="relative overflow-hidden rounded-2xl bg-black shadow-[0_50px_150px_-20px_rgba(0,0,0,0.9)]">
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
          {/* iMac neck + foot (attached, subtle) */}
          <div className="relative z-0 mx-auto h-10 w-28 bg-gradient-to-b from-[#141519] to-[#0b0b0e]" />
          <div className="relative z-0 mx-auto h-3 w-64 rounded-b-2xl bg-[#101015]" />

          {/* phone — a PRE-RENDERED 3D mockup PNG (this is how fomo gets the real look).
              No CSS frame / no CSS tilt: the device + angle live in the image itself. */}
          <div className="absolute -bottom-2 right-2 z-20 animate-floaty sm:right-10">
            <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#606AF7]/30 blur-3xl" />
            <Image
              src="/shots/phone.png"
              alt="ChadWallet app"
              width={340}
              height={700}
              priority
              className="h-auto w-[230px] drop-shadow-2xl sm:w-[270px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
