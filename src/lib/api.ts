import { Candle, Holder, Token, Trade } from "./types";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
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
  candles: (a: string) =>
    getJSON<{ source: string; candles: Candle[] }>(`/api/candles/${a}`),
  quote: (inputMint: string, outputMint: string, amount: number) =>
    getJSON<{ source: string; quote: any }>(
      `/api/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`
    ),
};
