import { Candle, Holder, Token, Trade } from "./types";

const BASE = "https://public-api.birdeye.so";
const KEY = process.env.BIRDEYE_API_KEY;

export function hasBirdeye(): boolean {
  return !!KEY && KEY.length > 8;
}

async function be<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const res = await fetch(`${BASE}${path}?${qs}`, {
    headers: {
      "X-API-KEY": KEY as string,
      "x-chain": "solana",
      accept: "application/json",
    },
    // BirdEye data is fast-moving; revalidate every 20s
    next: { revalidate: 20 },
  });
  if (!res.ok) throw new Error(`BirdEye ${path} -> ${res.status}`);
  const json = await res.json();
  if (json?.success === false) throw new Error(`BirdEye ${path} not successful`);
  return json.data as T;
}

interface BeTokenRow {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  price?: number;
  v24hUSD?: number;
  v24hChangePercent?: number;
  priceChange24hPercent?: number;
  liquidity?: number;
  mc?: number;
}

function mapToken(r: BeTokenRow): Token {
  return {
    address: r.address,
    symbol: r.symbol ?? "?",
    name: r.name ?? r.symbol ?? "Unknown",
    decimals: r.decimals ?? 9,
    logoURI: r.logoURI,
    price: r.price ?? 0,
    priceChange24h: r.priceChange24hPercent ?? r.v24hChangePercent ?? 0,
    volume24h: r.v24hUSD ?? 0,
    liquidity: r.liquidity ?? 0,
    marketCap: r.mc ?? 0,
  };
}

export async function fetchTrending(limit = 20): Promise<Token[]> {
  const data = await be<{ tokens: BeTokenRow[] }>("/defi/tokenlist", {
    sort_by: "v24hUSD",
    sort_type: "desc",
    offset: 0,
    limit,
  });
  return (data.tokens ?? []).map(mapToken);
}

export async function fetchTokenOverview(address: string): Promise<Token> {
  const r = await be<BeTokenRow>("/defi/token_overview", { address });
  return mapToken(r);
}

export async function fetchHolders(address: string, limit = 20): Promise<Holder[]> {
  const data = await be<{ items: any[] }>("/defi/v3/token/holder", {
    address,
    offset: 0,
    limit,
  });
  return (data.items ?? []).map((h, i) => ({
    rank: i + 1,
    owner: h.owner,
    amount: Number(h.ui_amount ?? h.amount ?? 0),
    percentage: Number(h.percentage ?? 0),
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
    id: t.txHash ?? `${address}-${i}`,
    side: (t.side as "buy" | "sell") ?? "buy",
    priceUsd: Number(t.priceUsd ?? t.price ?? 0),
    amountUsd: Number(t.volumeUSD ?? t.volumeUsd ?? 0),
    amountToken: Number(t.amount ?? 0),
    wallet: t.owner ?? t.from?.owner ?? "",
    time: Number(t.blockUnixTime ?? 0) * 1000,
    tx: t.txHash,
  }));
}

export async function fetchCandles(
  address: string,
  type = "15m"
): Promise<Candle[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 60 * 60 * 24 * 2; // 2 days
  const data = await be<{ items: any[] }>("/defi/ohlcv", {
    address,
    type,
    time_from: from,
    time_to: now,
  });
  return (data.items ?? []).map((c) => ({
    time: Number(c.unixTime),
    open: Number(c.o),
    high: Number(c.h),
    low: Number(c.l),
    close: Number(c.c),
    volume: Number(c.v ?? 0),
  }));
}
