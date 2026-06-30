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
          {/* monitor screen */}
          <div className="relative rounded-[18px] border border-ink-600 bg-[#0c0c12] p-2.5 shadow-panel">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-black">
              <Image
                src="/shots/terminal.png"
                alt="ChadWallet terminal"
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover object-top"
              />
            </div>
          </div>
          {/* iMac neck + foot */}
          <div className="mx-auto h-9 w-24 bg-gradient-to-b from-[#1a1b22] to-[#0e0e13]" />
          <div className="mx-auto h-2.5 w-52 rounded-b-xl rounded-t-sm bg-[#15161c]" />

          {/* tilted, floating phone with blue glow */}
          <div className="absolute -bottom-6 right-0 z-20 animate-floaty sm:-bottom-2 sm:right-6">
            {/* blue glow behind phone */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#606AF7]/30 blur-3xl" />
            {/* 3D tilt (separate element so the float translateY doesn't override it) */}
            <div style={{ transform: "perspective(1600px) rotateX(6deg) rotateY(-20deg) rotateZ(8deg)" }}>
              <PhoneFrame src="/shots/portfolio.png" width={220} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
