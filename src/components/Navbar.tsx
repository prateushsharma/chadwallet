"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { AuthButton } from "./AuthButton";

const ANDROID = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";
const IOS = "https://apps.apple.com/us/app/chadwallet/id6757367474";

export function Navbar({
  variant = "overlay",
}: {
  variant?: "overlay" | "solid";
}) {
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

        <div className="flex items-center gap-2.5">
          <StoreBadge
            href={IOS}
            kicker="Download on the"
            name="App Store"
            icon={
              <path d="M16.36 1.43c0 1.14-.42 2.2-1.25 3.04-.99 1-2.13 1.58-3.37 1.48-.15-1.1.4-2.27 1.16-3.03.85-.86 2.3-1.5 3.46-1.49zM20.5 17.2c-.55 1.27-.82 1.84-1.53 2.96-.99 1.57-2.39 3.52-4.12 3.53-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.01-3.06-1.77-4.05-3.34C-.07 15.95-.36 10.8 1.4 8.06c1.25-1.94 3.22-3.08 5.07-3.08 1.89 0 3.07 1.04 4.63 1.04 1.51 0 2.43-1.04 4.62-1.04 1.65 0 3.4.9 4.64 2.46-4.08 2.24-3.42 8.07.14 9.76z" />
            }
          />
          <StoreBadge
            href={ANDROID}
            kicker="Get it on"
            name="Google Play"
            icon={
              <path d="M3.6 2.2c-.3.3-.5.8-.5 1.4v16.8c0 .6.2 1.1.5 1.4l.1.1L13 12.6v-.2L3.7 2.1l-.1.1zm12.7 7.1L5.5 3.1l9.3 9.4-.2.2 1.7-1.7zm3.4 1.9-2.4-1.4-1.9 1.9 1.9 1.9 2.4-1.4c.7-.4.7-1.1 0-1.5z" />
            }
          />
          <AuthButton compact />
        </div>
      </div>
    </header>
  );
}

function StoreBadge({
  href,
  kicker,
  name,
  icon,
}: {
  href: string;
  kicker: string;
  name: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-glass hidden items-center gap-2 rounded-lg px-3 py-2 transition sm:flex"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-bone" aria-hidden>
        {icon}
      </svg>
      <span className="text-left leading-none">
        <span className="block text-[8px] uppercase tracking-wide text-muted">
          {kicker}
        </span>
        <span className="block font-display text-xs font-bold text-bone">
          {name}
        </span>
      </span>
    </a>
  );
}
