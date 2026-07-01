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
  verified?: boolean;
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

// Rich single-token overview from BirdEye /defi/token_overview.
// Extends the list-item Token with the fields fomo shows on the terminal.
export interface TokenOverview extends Token {
  ch5m: number;
  ch1h: number;
  ch4h: number;
  buys24h: number;
  sells24h: number;
  buyVol24h: number;
  sellVol24h: number;
  buyers24h: number;
  sellers24h: number;
  holders: number;
  supply: number;
  createdAtMs: number | null;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}
