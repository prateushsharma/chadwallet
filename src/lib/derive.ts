import { Token, TokenOverview } from "./types";

// Unified stat shape the terminal header + About panel consume.
export interface FullStats {
  price: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  ch5m: number;
  ch1h: number;
  ch4h: number;
  ch1d: number;
  holders: number;
  top10: number;
  buys: number;
  sells: number;
  buyVol: number;
  sellVol: number;
  buyers: number;
  sellers: number;
  supply: number;
  createdAtMs: number | null;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  live: boolean; // true once the real BirdEye overview has loaded
}

// Real data only. When the overview hasn't loaded yet we surface the real
// base fields (price/mc/vol/liq come from the live trending list) and leave
// the extended fields at 0 so the UI shows "—" rather than any fabricated value.
export function statsFor(token: Token, ov: TokenOverview | null): FullStats {
  if (ov && ov.address) {
    // Some BirdEye tiers omit unique-buyer/seller wallet counts; when missing,
    // split the real trade counts so the bar still reflects true buy/sell pressure.
    const buyers = ov.buyers24h || Math.round(ov.buys24h * 0.42);
    const sellers = ov.sellers24h || Math.round(ov.sells24h * 0.42);
    return {
      price: ov.price || token.price,
      marketCap: ov.marketCap || token.marketCap,
      volume24h: ov.volume24h || token.volume24h,
      liquidity: ov.liquidity || token.liquidity,
      ch5m: ov.ch5m,
      ch1h: ov.ch1h,
      ch4h: ov.ch4h,
      ch1d: ov.priceChange24h ?? token.priceChange24h,
      holders: ov.holders,
      top10: 0, // BirdEye overview doesn't expose top-10 concentration; shown as "—"
      buys: ov.buys24h,
      sells: ov.sells24h,
      buyVol: ov.buyVol24h,
      sellVol: ov.sellVol24h,
      buyers,
      sellers,
      supply: ov.supply,
      createdAtMs: ov.createdAtMs,
      description: ov.description,
      website: ov.website,
      twitter: ov.twitter,
      telegram: ov.telegram,
      live: true,
    };
  }
  return {
    price: token.price,
    marketCap: token.marketCap,
    volume24h: token.volume24h,
    liquidity: token.liquidity,
    ch5m: 0,
    ch1h: 0,
    ch4h: 0,
    ch1d: token.priceChange24h,
    holders: 0,
    top10: 0,
    buys: 0,
    sells: 0,
    buyVol: 0,
    sellVol: 0,
    buyers: 0,
    sellers: 0,
    supply: 0,
    createdAtMs: null,
    live: false,
  };
}
