"use client";

import React, { useState } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { usePrivyConfigured } from "@/app/providers";
import { shortAddr } from "@/lib/format";

/* ───────────────── Sign-in button (top nav) ───────────────── */

function PrivyButton({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  // after a successful login, drop the user straight into the terminal
  const { login } = useLogin({ onComplete: () => router.push("/trade") });

  if (!ready) {
    return <button disabled className="rounded-lg bg-ink-700 px-4 py-2 text-sm text-muted">Loading…</button>;
  }
  if (authenticated) {
    const label = user?.email?.address || user?.google?.email || shortAddr(user?.wallet?.address ?? "wallet");
    return (
      <button onClick={logout} className="group rounded-lg border border-ink-500 bg-ink-700 px-4 py-2 text-sm font-medium text-bone transition hover:border-chad/50">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-mint align-middle" />
        {label}
        <span className="ml-2 text-muted group-hover:text-ember">Sign out</span>
      </button>
    );
  }
  return (
    <button onClick={() => login()} className="rounded-lg bg-chad px-4 py-2 text-sm font-bold text-ink transition hover:bg-chad-glow">
      {compact ? "Sign in" : "Sign in with Apple / Google"}
    </button>
  );
}

function DemoButton({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="rounded-lg bg-chad px-4 py-2 text-sm font-bold text-ink transition hover:bg-chad-glow">
        {compact ? "Sign in" : "Sign in with Apple / Google"}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-ink-500 bg-ink-800 p-4 text-sm shadow-panel">
          <p className="font-display font-bold text-bone">Demo mode</p>
          <p className="mt-1 text-muted">Privy isn’t configured, so sign-in is simulated. Add <code className="rounded bg-ink-700 px-1 text-chad">NEXT_PUBLIC_PRIVY_APP_ID</code> for real Apple / Google login.</p>
          <button onClick={() => { setOpen(false); router.push("/trade"); }} className="mt-3 w-full rounded-lg bg-chad py-1.5 font-bold text-ink">Enter terminal</button>
        </div>
      )}
    </div>
  );
}

export function AuthButton({ compact }: { compact?: boolean }) {
  const configured = usePrivyConfigured();
  return configured ? <PrivyButton compact={compact} /> : <DemoButton compact={compact} />;
}

/* ───────────────── Start-trading CTA (landing) ─────────────────
   Triggers the sign-in popup; on success routes into the terminal.
   In demo mode it just enters the terminal.                        */

function PrivyStart({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const { authenticated } = usePrivy();
  const { login } = useLogin({ onComplete: () => router.push("/trade") });
  return (
    <button onClick={() => (authenticated ? router.push("/trade") : login())} className={className}>
      {children}
    </button>
  );
}

export function StartTradingButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const configured = usePrivyConfigured();
  const router = useRouter();
  if (configured) return <PrivyStart className={className}>{children}</PrivyStart>;
  return <button onClick={() => router.push("/trade")} className={className}>{children}</button>;
}
