import { Candle, Holder, Token, Trade } from "./types";

const BASE = "https://public-api.birdeye.so";
const KEY = process.env.BIRDEYE_API_KEY;

export function hasBirdeye(): boolean {
  return !!KEY && KEY.length > 8;
}

function headers() {
  return { "X-API-KEY": KEY as string, "x-chain": "solana", accept: "application/json" };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── global rate limiter: ~1 request/sec to respect the free tier ──────── */
const MIN_INTERVAL = 1200;
let lastCall = 0;
let chain: Promise<void> = Promise.resolve();
function schedule<T>(fn: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const wait = MIN_INTERVAL - (Date.now() - lastCall);
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();
    return fn();
  };
  const p = chain.then(run, run);
  chain = p.then(() => {}, () => {});
  return p as Promise<T>;
}

/* ── in-memory cache + single-flight (per server instance) ─────────────── */
const cache = new Map<string, { t: number; v: any }>();
const inflight = new Map<string, Promise<any>>();
async function cached<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < ttl) return hit.v as T;
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  const p = fn()
    .then((v) => {
      cache.set(key, { t: Date.now(), v });
      inflight.delete(key);
      return v;
    })
    .catch((e) => {
      inflight.delete(key);
      // serve stale on error if we have it
      const stale = cache.get(key);
      if (stale) return stale.v as T;
      throw e;
    });
  inflight.set(key, p);
  return p;
}

export async function beRaw(
  path: string,
  params: Record<string, string | number> = {}
): Promise<{ ok: boolean; status: number; json: any; text: string }> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;
  return schedule(async () => {
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch {}
    return { ok: res.ok && json?.success !== false, status: res.status, json, text };
  });
}

async function be<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const r = await beRaw(path, params);
  if (!r.ok) {
    const msg = `BirdEye ${path} -> ${r.status} ${r.text.slice(0, 140)}`;
    console.error("[birdeye]", msg);
    throw new Error(msg);
  }
  return r.json.data as T;
}

function mapToken(r: any): Token {
  return {
    address: r.address,
    symbol: r.symbol ?? "?",
    name: r.name ?? r.symbol ?? "Unknown",
    decimals: r.decimals ?? 9,
    logoURI: r.logo_uri ?? r.logoURI ?? r.icon,
    price: Number(r.price ?? 0),
    priceChange24h: Number(r.price_change_24h_percent ?? r.priceChange24hPercent ?? r.v24hChangePercent ?? 0),
    volume24h: Number(r.volume_24h_usd ?? r.v24hUSD ?? r.volume24h ?? 0),
    liquidity: Number(r.liquidity ?? 0),
    marketCap: Number(r.market_cap ?? r.marketcap ?? r.mc ?? r.fdv ?? 0),
  };
}

export async function fetchTrending(limit = 20): Promise<Token[]> {
  return cached("trending", 60_000, async () => {
    try {
      const data = await be<{ items?: any[]; tokens?: any[] }>("/defi/v3/token/list", {
        sort_by: "volume_24h_usd", sort_type: "desc", offset: 0, limit, min_liquidity: 5000,
      });
      const rows = data.items ?? data.tokens ?? [];
      const mapped = rows.map(mapToken).filter((t) => t.address);
      if (mapped.length) return mapped;
    } catch {}
    const data = await be<{ tokens: any[] }>("/defi/tokenlist", {
      sort_by: "v24hUSD", sort_type: "desc", offset: 0, limit,
    });
    return (data.tokens ?? []).map(mapToken).filter((t) => t.address);
  });
}

export async function fetchTokenOverview(address: string): Promise<Token> {
  return cached(`token:${address}`, 30_000, async () => {
    const r = await be<any>("/defi/token_overview", { address });
    return mapToken(r);
  });
}

export async function fetchHolders(address: string, limit = 20): Promise<Holder[]> {
  return cached(`holders:${address}`, 45_000, async () => {
    const data = await be<{ items: any[] }>("/defi/v3/token/holder", { address, offset: 0, limit });
    const items = data.items ?? [];
    const total = items.reduce((s, h) => s + Number(h.ui_amount ?? h.amount ?? 0), 0) || 1;
    return items.map((h, i) => ({
      rank: i + 1,
      owner: h.owner ?? h.wallet ?? "",
      amount: Number(h.ui_amount ?? h.amount ?? 0),
      percentage: Number(h.percentage ?? (Number(h.ui_amount ?? h.amount ?? 0) / total) * 100),
    }));
  });
}

export async function fetchTrades(address: string, limit = 30): Promise<Trade[]> {
  return cached(`trades:${address}`, 20_000, async () => {
    const data = await be<{ items: any[] }>("/defi/txs/token", {
      address, tx_type: "swap", sort_type: "desc", offset: 0, limit,
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
  });
}

const CANDLE_WINDOW: Record<string, number> = {
  "1m": 60 * 60 * 6,
  "5m": 60 * 60 * 24,
  "15m": 60 * 60 * 24 * 2,
  "1H": 60 * 60 * 24 * 10,
  "4H": 60 * 60 * 24 * 30,
  "1D": 60 * 60 * 24 * 365,
};

export async function fetchCandles(address: string, type = "15m"): Promise<Candle[]> {
  return cached(`candles:${address}:${type}`, 8_000, async () => {
    const now = Math.floor(Date.now() / 1000);
    const from = now - (CANDLE_WINDOW[type] ?? 60 * 60 * 24 * 2);
    const data = await be<{ items: any[] }>("/defi/ohlcv", { address, type, time_from: from, time_to: now });
    return (data.items ?? []).map((c) => ({
      time: Number(c.unixTime ?? c.unix_time),
      open: Number(c.o), high: Number(c.h), low: Number(c.l), close: Number(c.c), volume: Number(c.v ?? 0),
    }));
  });
}
