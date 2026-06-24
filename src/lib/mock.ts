import { Candle, Holder, Token, Trade } from "./types";

// Real Solana mint addresses so links/logos resolve; prices are illustrative
// fallbacks used only when no BIRDEYE_API_KEY is configured.
export const MOCK_TOKENS: Token[] = [
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    price: 168.42,
    priceChange24h: 4.31,
    volume24h: 1_842_000_000,
    liquidity: 92_400_000,
    marketCap: 79_200_000_000,
  },
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
    price: 0.0000241,
    priceChange24h: 12.8,
    volume24h: 188_000_000,
    liquidity: 14_200_000,
    marketCap: 1_780_000_000,
  },
  {
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    symbol: "WIF",
    name: "dogwifhat",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm/logo.png",
    price: 2.71,
    priceChange24h: -6.42,
    volume24h: 312_000_000,
    liquidity: 38_900_000,
    marketCap: 2_710_000_000,
  },
  {
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    symbol: "JUP",
    name: "Jupiter",
    decimals: 6,
    logoURI:
      "https://static.jup.ag/jup/icon.png",
    price: 0.842,
    priceChange24h: 2.14,
    volume24h: 96_400_000,
    liquidity: 22_100_000,
    marketCap: 1_130_000_000,
  },
  {
    address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    symbol: "POPCAT",
    name: "Popcat",
    decimals: 9,
    logoURI:
      "https://dd.dexscreener.com/ds-data/tokens/solana/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr.png",
    price: 1.18,
    priceChange24h: 18.6,
    volume24h: 74_300_000,
    liquidity: 11_700_000,
    marketCap: 1_160_000_000,
  },
  {
    address: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
    symbol: "MEW",
    name: "cat in a dogs world",
    decimals: 5,
    logoURI:
      "https://dd.dexscreener.com/ds-data/tokens/solana/MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5.png",
    price: 0.00712,
    priceChange24h: -3.11,
    volume24h: 41_900_000,
    liquidity: 8_400_000,
    marketCap: 632_000_000,
  },
  {
    address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ7i8na",
    symbol: "BOME",
    name: "BOOK OF MEME",
    decimals: 6,
    logoURI:
      "https://dd.dexscreener.com/ds-data/tokens/solana/ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ7i8na.png",
    price: 0.00913,
    priceChange24h: 7.72,
    volume24h: 33_100_000,
    liquidity: 6_900_000,
    marketCap: 639_000_000,
  },
  {
    address: "CATSrdYqYAyKDXm5cwzeXAd6sM47RrYHtZ2Rmt68exuU",
    symbol: "GIGA",
    name: "Gigachad",
    decimals: 5,
    logoURI:
      "https://dd.dexscreener.com/ds-data/tokens/solana/giga.png",
    price: 0.0431,
    priceChange24h: 24.9,
    volume24h: 28_600_000,
    liquidity: 5_300_000,
    marketCap: 431_000_000,
  },
  {
    address: "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9",
    symbol: "MICHI",
    name: "michi",
    decimals: 6,
    logoURI:
      "https://dd.dexscreener.com/ds-data/tokens/solana/michi.png",
    price: 0.221,
    priceChange24h: -9.4,
    volume24h: 19_400_000,
    liquidity: 4_100_000,
    marketCap: 221_000_000,
  },
  {
    address: "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4",
    symbol: "MYRO",
    name: "Myro",
    decimals: 9,
    logoURI:
      "https://dd.dexscreener.com/ds-data/tokens/solana/myro.png",
    price: 0.0892,
    priceChange24h: 5.18,
    volume24h: 12_800_000,
    liquidity: 3_600_000,
    marketCap: 89_200_000,
  },
];

// Deterministic pseudo-random so SSR and client match (avoids hydration drift)
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) + 1;
}

export function mockHolders(token: Token): Holder[] {
  const rand = seeded(hashStr(token.address));
  const holders: Holder[] = [];
  let remaining = 100;
  for (let i = 0; i < 20; i++) {
    const pct =
      i === 0
        ? 8 + rand() * 6
        : Math.max(0.4, (remaining / (22 - i)) * (0.6 + rand()));
    remaining -= pct;
    holders.push({
      rank: i + 1,
      owner: genWallet(rand),
      percentage: Math.max(0.1, pct),
      amount: (token.marketCap / token.price) * (pct / 100),
    });
  }
  return holders;
}

export function mockTrades(token: Token, count = 30): Trade[] {
  const rand = seeded(hashStr(token.symbol) + 7);
  const trades: Trade[] = [];
  for (let i = 0; i < count; i++) {
    const side = rand() > 0.46 ? "buy" : "sell";
    const amountUsd = 20 + rand() * 18000;
    trades.push({
      id: `${token.address}-${i}`,
      side,
      priceUsd: token.price * (1 + (rand() - 0.5) * 0.01),
      amountUsd,
      amountToken: amountUsd / token.price,
      wallet: genWallet(rand),
      time: Date.now() - i * (4000 + rand() * 20000),
    });
  }
  return trades;
}

export function mockCandles(token: Token, points = 160): Candle[] {
  const rand = seeded(hashStr(token.address) + 3);
  const candles: Candle[] = [];
  let price = token.price * (1 - token.priceChange24h / 100);
  const now = Math.floor(Date.now() / 1000);
  const step = 900; // 15m
  for (let i = points; i > 0; i--) {
    const drift = (token.priceChange24h / 100 / points) * price;
    const vol = price * 0.02;
    const open = price;
    const close = Math.max(price * 0.0001, open + drift + (rand() - 0.5) * vol);
    const high = Math.max(open, close) + rand() * vol * 0.6;
    const low = Math.min(open, close) - rand() * vol * 0.6;
    candles.push({
      time: now - i * step,
      open,
      high,
      low: Math.max(low, price * 0.00005),
      close,
      volume: 1000 + rand() * 90000,
    });
    price = close;
  }
  return candles;
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function genWallet(rand: () => number): string {
  let s = "";
  for (let i = 0; i < 44; i++) s += B58[Math.floor(rand() * B58.length)];
  return s;
}

export function findMock(address: string): Token | undefined {
  return MOCK_TOKENS.find((t) => t.address === address);
}
