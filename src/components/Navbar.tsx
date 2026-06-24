"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { AuthButton } from "./AuthButton";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink-900/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="ChadWallet home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#features" className="text-sm text-muted transition hover:text-bone">
            Features
          </a>
          <a href="/#how" className="text-sm text-muted transition hover:text-bone">
            How it works
          </a>
          <a href="/#download" className="text-sm text-muted transition hover:text-bone">
            Get the app
          </a>
          <Link href="/trade" className="text-sm text-muted transition hover:text-bone">
            Trade
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/trade"
            className="hidden rounded-lg border border-ink-500 px-4 py-2 text-sm font-medium text-bone transition hover:border-chad/50 sm:inline-block"
          >
            Launch terminal
          </Link>
          <AuthButton compact />
        </div>
      </div>
    </header>
  );
}
