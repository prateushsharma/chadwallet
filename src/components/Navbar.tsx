"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { StartTradingButton } from "./AuthButton";

const ANDROID = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";
const IOS = "https://apps.apple.com/us/app/chadwallet/id6757367474";

export function Navbar({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const wrap =
    variant === "solid"
      ? "sticky top-0 z-40 border-b border-ink-600 bg-ink-900/85 backdrop-blur"
      : "absolute inset-x-0 top-0 z-40";
  return (
    <header className={wrap}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="ChadWallet home">
          <Logo size={30} />
        </Link>

        <div className="flex items-center gap-3">
          {/* official store badges inside dark pills (like fomo) */}
          <a href={IOS} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store" className="hidden h-12 items-center rounded-xl border border-white/12 bg-black/85 px-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-black sm:flex">
            <svg width="110" height="34" className="block">
              <use href="/images/sprite.svg#apple-cta" />
            </svg>
          </a>
          <a href={ANDROID} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play" className="hidden h-12 items-center rounded-xl border border-white/12 bg-black/85 px-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-black sm:flex">
            <svg width="124" height="36" className="block">
              <use href="/images/sprite.svg#google-cta" />
            </svg>
          </a>

          <StartTradingButton className="h-12 rounded-xl px-6 font-bold text-bone ring-1 ring-ink-600 transition bg-ink-800 hover:bg-ink-800/80">
            Login
          </StartTradingButton>
        </div>
      </div>
    </header>
  );
}
