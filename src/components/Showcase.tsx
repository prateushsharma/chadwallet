"use client";

import React from "react";
import Image from "next/image";

function PhoneFrame({ src, width = 220 }: { src: string; width?: number }) {
  return (
    <div
      className="relative rounded-[2.2rem] border-[8px] border-[#0d0e13] bg-black shadow-2xl ring-1 ring-white/10"
      style={{ width }}
    >
      <div className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[1.65rem]">
        <Image src={src} alt="" width={720} height={1558} className="h-auto w-full" />
      </div>
    </div>
  );
}

export function Showcase() {
  return (
    <section className="relative overflow-hidden border-t border-ink-600 bg-ink-900">
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
          {/* soft ambient glow around the whole monitor — no hard edges */}
          <div className="pointer-events-none absolute -inset-x-12 -inset-y-10 -z-10">
            <div className="h-full w-full rounded-[60px] bg-[#2b3a6b]/25 blur-[100px]" />
          </div>

          {/* monitor — minimal bezel that melts into the background (no border, no stand) */}
          <div className="relative rounded-[20px] bg-[#0d0d12] p-3 shadow-[0_60px_160px_-30px_rgba(0,0,0,0.85)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[20px] bg-white/[0.06]" />
            <div className="mx-auto mb-2 h-1 w-1 rounded-full bg-white/15" />
            <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-black">
              <Image
                src="/shots/terminal.png"
                alt="ChadWallet terminal"
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* tilted, floating phone with blue glow */}
          <div className="absolute -bottom-10 right-0 z-20 animate-floaty sm:right-4">
            <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#606AF7]/35 blur-3xl" />
            <div style={{ transform: "perspective(1600px) rotateX(6deg) rotateY(-20deg) rotateZ(8deg)" }}>
              <PhoneFrame src="/shots/portfolio.png" width={230} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
