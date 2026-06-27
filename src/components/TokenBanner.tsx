"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Token } from "@/lib/types";
import { MOCK_TOKENS } from "@/lib/mock";
import { fmtUsd, fmtPct } from "@/lib/format";

function TokenPill({ t, onClick }: { t: Token; onClick: () => void }) {
  const up = t.priceChange24h >= 0;
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2.5 px-4 py-2 transition hover:bg-ink-700/60"
      aria-label={`Open ${t.symbol} trading`}
    >
      {t.logoURI ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={t.logoURI}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] rounded-full bg-ink-600 object-cover"
          onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
        />
      ) : (
        <span className="h-[18px] w-[18px] rounded-full bg-ink-500" />
      )}
      <span className="led text-sm font-bold text-bone">{t.symbol}</span>
      <span className="led text-sm text-muted">{fmtUsd(t.price)}</span>
      <span
        className={`led text-sm font-bold ${up ? "text-mint" : "text-ember"}`}
      >
        {up ? "▲" : "▼"} {fmtPct(t.priceChange24h).replace("+", "")}
      </span>
    </button>
  );
}

export function TokenBanner({
  reverse = false,
  speed = 46,
}: {
  reverse?: boolean;
  speed?: number;
}) {
  const router = useRouter();
  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS);

  useEffect(() => {
    let alive = true;
    api
      .trending()
      .then((r) => alive && r.tokens?.length && setTokens(r.tokens))
      .catch(() => {});
    const id = setInterval(() => {
      api.trending().then((r) => alive && r.tokens?.length && setTokens(r.tokens)).catch(() => {});
    }, 60000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const go = (addr: string) => router.push(`/trade?token=${addr}`);
  // duplicate the list so the marquee loops seamlessly
  const loop = [...tokens, ...tokens];

  return (
    <div className="marquee-strip relative overflow-hidden border-y border-ink-600 bg-ink-800/80 backdrop-blur">
      <div
        className={`marquee-track ${reverse ? "animate-marquee-rev" : "animate-marquee"} divide-x divide-ink-600`}
        style={{ ["--marquee-duration" as any]: `${speed}s` }}
      >
        {loop.map((t, i) => (
          <TokenPill key={`${t.address}-${i}`} t={t} onClick={() => go(t.address)} />
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-800 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-800 to-transparent" />
    </div>
  );
}
