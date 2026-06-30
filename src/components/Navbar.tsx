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
          <a className="store-badge app-store hidden sm:flex" href={IOS} target="_blank" rel="noopener noreferrer">
            <svg className="apple-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M16.365 1.43c0 1.14-.416 2.13-1.25 2.98-.897.91-1.876 1.43-2.94 1.35-.13-1.09.39-2.25 1.18-3.05.86-.87 2.05-1.5 3.01-1.28ZM20.66 17.4c-.54 1.25-.8 1.8-1.5 2.9-.97 1.48-2.33 3.33-4.02 3.35-1.5.02-1.88-.98-3.92-.97-2.03.01-2.45 1-3.95.98-1.69-.02-2.98-1.68-3.95-3.16-2.7-4.14-2.98-9-.1-11.58 1.03-.92 2.42-1.5 3.73-1.52 1.47-.03 2.86 1 3.76 1 .9 0 2.58-1.23 4.35-1.05.74.03 2.82.3 4.15 2.25-.1.06-2.48 1.44-2.45 4.37.03 3.5 3.05 4.66 3.9 4.43Z"/>
            </svg>
            <span className="badge-text">
              <span className="badge-small">Download on the</span>
              <span className="badge-big">App Store</span>
            </span>
          </a>

          <a className="store-badge google-play hidden sm:flex" href={ANDROID} target="_blank" rel="noopener noreferrer">
            <svg className="play-icon" viewBox="0 0 512 512" aria-hidden="true">
              <path fill="#34A853" d="M99 35c-10 6-16 18-16 34v374c0 16 6 28 16 34l212-221L99 35Z"/>
              <path fill="#4285F4" d="M99 35l212 221 63-66L126 50c-10-6-20-11-27-15Z"/>
              <path fill="#FBBC04" d="M311 256 99 477c8-4 17-9 27-15l248-140-63-66Z"/>
              <path fill="#EA4335" d="M429 225l-55-35-63 66 63 66 55-35c24-14 24-48 0-62Z"/>
            </svg>
            <span className="badge-text">
              <span className="badge-small">GET IT ON</span>
              <span className="badge-big">Google Play</span>
            </span>
          </a>

          <StartTradingButton className="login-pill">Login</StartTradingButton>
        </div>
      </div>
    </header>
  );
}
