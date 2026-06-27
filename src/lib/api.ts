import { Candle, Holder, Token, Trade } from "./types";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

export const api = {
  trending: () =>
    getJSON<{ source: string; tokens: Token[] }>("/api/trending"),
  token: (a: string) =>
    getJSON<{ source: string; token: Token }>(`/api/token/${a}`),
  holders: (a: string) =>
    getJSON<{ source: string; holders: Holder[] }>(`/api/holders/${a}`),
  trades: (a: string) =>
    getJSON<{ source: string; trades: Trade[] }>(`/api/trades/${a}`),
  candles: (a: string, type = "15m") =>
    getJSON<{ source: string; candles: Candle[] }>(`/api/candles/${a}?type=${type}`),
  quote: (inputMint: string, outputMint: string, amount: number) =>
    getJSON<{ source: string; quote: any; raw?: any }>(
      `/api/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`
    ),
  // Build a signable Jupiter swap transaction (base64 VersionedTransaction).
  swap: (quoteResponse: any, userPublicKey: string) =>
    postJSON<{ swapTransaction: string }>("/api/swap", {
      quoteResponse,
      userPublicKey,
    }),
};
