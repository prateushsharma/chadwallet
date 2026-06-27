"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Shows whether the terminal is on live BirdEye data or mock fallback.
// Click-through to /api/health to see per-endpoint status.
export function LiveBadge() {
  const [source, setSource] = useState<"loading" | "birdeye" | "mock">("loading");

  useEffect(() => {
    api.trending().then((r) => setSource(r.source === "birdeye" ? "birdeye" : "mock")).catch(() => setSource("mock"));
  }, []);

  const live = source === "birdeye";
  return (
    <a
      href="/api/health"
      target="_blank"
      rel="noopener noreferrer"
      title="Data source — click for endpoint diagnostics"
      className={`led flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] ${
        live
          ? "border-mint/40 text-mint"
          : source === "mock"
          ? "border-gold/40 text-gold"
          : "border-ink-500 text-muted"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-mint" : "bg-gold"} ${source !== "loading" ? "animate-pulse" : ""}`} />
      {source === "loading" ? "…" : live ? "LIVE" : "DEMO"}
    </a>
  );
}
