import React from "react";

const FEATURES = [
  {
    k: "01",
    title: "Fast trading in seconds",
    body: "Buy and sell trending Solana tokens 24/7. Orders route through Jupiter for the best price across every DEX — no pool-hopping.",
  },
  {
    k: "02",
    title: "Take the guesswork out",
    body: "Watch large trades and top traders move in real time. See what the smart money is buying before the candle prints.",
  },
  {
    k: "03",
    title: "Live on-chain data",
    body: "Prices, charts, holders and trade-by-trade flow stream straight from chain via BirdEye. Always current, never stale.",
  },
  {
    k: "04",
    title: "Yours, always",
    body: "Self-custody by default. Sign in with Apple or Google through Privy — a wallet in seconds, no seed phrase to lose.",
  },
];

const STEPS = [
  { n: "1", t: "Sign in", d: "Tap Apple or Google. Privy spins up a self-custody Solana wallet instantly." },
  { n: "2", t: "Fund it", d: "Send SOL or buy in-app. Your balance is ready to trade right away." },
  { n: "3", t: "Never miss a breakout", d: "Follow the feed, spot the movers, and swap with one tap." },
];

export function Features() {
  return (
    <>
      <section id="features" className="border-t border-ink-600">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="led text-sm uppercase tracking-widest text-chad">
              Why ChadWallet
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              A trading desk in your pocket.
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink-600 bg-ink-600 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.k}
                className="group bg-ink-900 p-8 transition hover:bg-ink-800"
              >
                <span className="led text-sm text-chad">{f.k}</span>
                <h3 className="mt-3 font-display text-xl font-bold text-bone">
                  {f.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-ink-600 bg-ink-800/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            From signed-out to first swap in under a minute.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chad font-display text-xl font-bold text-ink">
                  {s.n}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-bone">
                  {s.t}
                </h3>
                <p className="mt-2 leading-relaxed text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
