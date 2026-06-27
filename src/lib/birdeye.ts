import { Candle, Holder, Token, Trade } from "./types";

const BASE = "https://public-api.birdeye.so";
const KEY = process.env.BIRDEYE_API_KEY;

export function hasBirdeye(): boolean {
  return !!KEY && KEY.length > 8;
}

function headers() {
  return {
    "X-API-KEY": KEY as string,
    "x-chain": "solana",
    accept: "application/json",
  };
}

// Raw call — returns status + body so the health route can report exactly
// what BirdEye said (useful for diagnosing tier/key issues).
export async function beRaw(
  path: string,
  params: Record<string, string | number> = {}
): Promise<{ ok: boolean; status: number; json: any; text: string }> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { ok: res.ok && json?.success !== false, status: res.status, json, text };
}

// Throwing call used by the data fetchers.
async function be<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const r = await beRaw(path, params);
  if (!r.ok) {
    const msg = `BirdEye ${path} -> ${r.status} ${r.text.slice(0, 160)}`;
    console.error("[birdeye]", msg);
    throw new Error(msg);
  }
  return r.json.data as T;
}

// Map a token row from any BirdEye shape (V3 snake_case OR legacy camelCase).
function mapToken(r: any): Token {
  return {
    address: r.address,
    symbol: r.symbol ?? "?",
    name: r.name ?? r.symbol ?? "Unknown",
    decimals: r.decimals ?? 9,
    logoURI: r.logo_uri ?? r.logoURI ?? r.icon,
    price: Number(r.price ?? 0),
    priceChange24h: Number(
      r.price_change_24h_percent ?? r.priceChange24hPercent ?? r.v24hChangePercent ?? 0
    ),
    volume24h: Number(r.volume_24h_usd ?? r.v24hUSD ?? r.volume24h ?? 0),
    liquidity: Number(r.liquidity ?? 0),
    marketCap: Number(r.market_cap ?? r.marketcap ?? r.mc ?? r.fdv ?? 0),
  };
}

export async function fetchTrending(limit = 20): Promise<Token[]> {
  // Preferred: V3 token list (price + change + mc in one free-tier call).
  try {
    const data = await be<{ items?: any[]; tokens?: any[] }>("/defi/v3/token/list", {
      sort_by: "volume_24h_usd",
      sort_type: "desc",
      offset: 0,
      limit,
      min_liquidity: 5000,
    });
    const rows = data.items ?? data.tokens ?? [];
    const mapped = rows.map(mapToken).filter((t) => t.address);
    if (mapped.length) return mapped;
  } catch (e) {
    /* fall through */
  }
  // Fallback: legacy tokenlist.
  const data = await be<{ tokens: any[] }>("/defi/tokenlist", {
    sort_by: "v24hUSD",
    sort_type: "desc",
    offset: 0,
    limit,
  });
  return (data.tokens ?? []).map(mapToken).filter((t) => t.address);
}

export async function fetchTokenOverview(address: string): Promise<Token> {
  const r = await be<any>("/defi/token_overview", { address });
  return mapToken(r);
}

export async function fetchHolders(address: string, limit = 20): Promise<Holder[]> {
  // NOTE: holder list requires BirdEye Starter package or above.
  const data = await be<{ items: any[] }>("/defi/v3/token/holder", {
    address,
    offset: 0,
    limit,
  });
  const items = data.items ?? [];
  const total = items.reduce((s, h) => s + Number(h.ui_amount ?? h.amount ?? 0), 0) || 1;
  return items.map((h, i) => ({
    rank: i + 1,
    owner: h.owner ?? h.wallet ?? "",
    amount: Number(h.ui_amount ?? h.amount ?? 0),
    percentage: Number(h.percentage ?? (Number(h.ui_amount ?? h.amount ?? 0) / total) * 100),
  }));
}

export async function fetchTrades(address: string, limit = 30): Promise<Trade[]> {
  const data = await be<{ items: any[] }>("/defi/txs/token", {
    address,
    tx_type: "swap",
    sort_type: "desc",
    offset: 0,
    limit,
  });
  return (data.items ?? []).map((t, i) => ({
    id: t.tx_hash ?? t.txHash ?? `${address}-${i}`,
    side: (t.side as "buy" | "sell") ?? "buy",
    priceUsd: Number(t.price_usd ?? t.priceUsd ?? t.price ?? 0),
    amountUsd: Number(t.volume_usd ?? t.volumeUSD ?? t.volumeUsd ?? 0),
    amountToken: Number(t.amount ?? t.base?.ui_amount ?? 0),
    wallet: t.owner ?? t.from?.owner ?? "",
    time: Number(t.block_unix_time ?? t.blockUnixTime ?? 0) * 1000,
    tx: t.tx_hash ?? t.txHash,
  }));
}

export async function fetchCandles(address: string, type = "15m"): Promise<Candle[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 60 * 60 * 24 * 2;
  const data = await be<{ items: any[] }>("/defi/ohlcv", {
    address,
    type,
    time_from: from,
    time_to: now,
  });
  return (data.items ?? []).map((c) => ({
    time: Number(c.unixTime ?? c.unix_time),
    open: Number(c.o),
    high: Number(c.h),
    low: Number(c.l),
    close: Number(c.c),
    volume: Number(c.v ?? 0),
  }));
}
