export interface Token {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
  decimals: number;
  price: number;
  priceChange24h: number; // percent
  volume24h: number;
  liquidity: number;
  marketCap: number;
}

export interface Holder {
  owner: string;
  amount: number;
  percentage: number;
  rank: number;
}

export interface Trade {
  id: string;
  side: "buy" | "sell";
  priceUsd: number;
  amountToken: number;
  amountUsd: number;
  wallet: string;
  time: number; // unix ms
  tx?: string;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface QuoteResult {
  inAmount: number;
  outAmount: number;
  priceImpactPct: number;
  route: string[];
}
