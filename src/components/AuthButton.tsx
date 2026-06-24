"use client";

import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyConfigured } from "@/app/providers";
import { shortAddr } from "@/lib/format";

function PrivyButton({ compact }: { compact?: boolean }) {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <button
        disabled
        className="rounded-lg bg-ink-700 px-4 py-2 text-sm text-muted"
      >
        Loading…
      </button>
    );
  }

  if (authenticated) {
    const label =
      user?.email?.address ||
      user?.google?.email ||
      shortAddr(user?.wallet?.address ?? "wallet");
    return (
      <button
        onClick={logout}
        className="group rounded-lg border border-ink-500 bg-ink-700 px-4 py-2 text-sm font-medium text-bone transition hover:border-chad/50"
      >
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-mint align-middle" />
        {label}
        <span className="ml-2 text-muted group-hover:text-ember">Sign out</span>
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="rounded-lg bg-chad px-4 py-2 text-sm font-bold text-ink transition hover:bg-chad-glow"
    >
      {compact ? "Sign in" : "Sign in with Apple / Google"}
    </button>
  );
}

function DemoButton({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg bg-chad px-4 py-2 text-sm font-bold text-ink transition hover:bg-chad-glow"
      >
        {compact ? "Sign in" : "Sign in with Apple / Google"}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-ink-500 bg-ink-800 p-4 text-sm shadow-panel">
          <p className="font-display font-bold text-bone">Privy not configured</p>
          <p className="mt-1 text-muted">
            Add{" "}
            <code className="rounded bg-ink-700 px-1 text-chad">
              NEXT_PUBLIC_PRIVY_APP_ID
            </code>{" "}
            to <code className="rounded bg-ink-700 px-1">.env.local</code> to
            enable Apple / Google sign-in via Privy.
          </p>
          <button
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-lg bg-ink-600 py-1.5 text-bone hover:bg-ink-500"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}

export function AuthButton({ compact }: { compact?: boolean }) {
  const configured = usePrivyConfigured();
  return configured ? (
    <PrivyButton compact={compact} />
  ) : (
    <DemoButton compact={compact} />
  );
}
