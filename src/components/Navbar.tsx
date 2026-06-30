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

        <div className="fomo-top-buttons">
          {/* your glass spec (.store-badge) wrapping the official sprite logos */}
          <a href={IOS} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store" className="store-badge app-store hidden sm:flex">
            <svg width="118" height="36" className="block">
              <use href="/images/sprite.svg#apple-cta" />
            </svg>
          </a>
          <a href={ANDROID} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play" className="store-badge google-play hidden sm:flex">
            <svg width="135" height="40" className="block">
              <use href="/images/sprite.svg#google-cta" />
            </svg>
          </a>

          <StartTradingButton className="login-pill">Login</StartTradingButton>
        </div>
      </div>
    </header>
  );
}
