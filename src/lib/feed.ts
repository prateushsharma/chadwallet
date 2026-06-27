import { Token } from "./types";

function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) + 1;
}

const NAMES = [
  "shymee", "TraderAG_", "0xbananajam", "N0ah63", "irulan", "frank", "juggin",
  "DumbCrayonEater", "PoorGoat_", "0xjumpman", "cobie.sol", "ansemfan", "degenmike",
  "solshark", "vibe.eth", "moonboi", "chadtrader", "wifhat", "gigabrain",
];
const THESES = [
  "Be Delusional. It's the Only Way to Actually Win.",
  "Top 10 holders are diamond. Not selling.",
  "Narrative is just getting started, early.",
  "Chart looks primed for a leg up.",
  "Aped the dip, conviction max.",
  "This is the meta now. Simple as.",
  "Volume confirms the breakout.",
  "Following the smart money in here.",
];

export interface FeedItem {
  id: string;
  kind: "trade" | "group";
  user: string;
  side: "buy" | "sell";
  hue: number;
  tokenSym: string;
  amountUsd: number;
  mc: number;
  age: string;
  groupCount?: number;
  tokenLogo?: string;
  changePct?: number;
}

const AGES = ["now", "14s", "27s", "1m", "2m", "3m", "5m", "8m"];

export function genFeed(token: Token, count = 14): FeedItem[] {
  const r = seeded(hash(token.address) + 11);
  const items: FeedItem[] = [];
  for (let i = 0; i < count; i++) {
    const isGroup = r() > 0.78;
    const side: "buy" | "sell" = r() > 0.45 ? "buy" : "sell";
    const user = NAMES[Math.floor(r() * NAMES.length)];
    items.push({
      id: `${token.address}-f-${i}`,
      kind: isGroup ? "group" : "trade",
      user,
      side,
      hue: Math.floor(r() * 360),
      tokenSym: token.symbol,
      amountUsd: 200 + r() * 80000,
      mc: token.marketCap * (0.9 + r() * 0.2),
      age: AGES[Math.min(AGES.length - 1, i)],
      groupCount: isGroup ? 3 + Math.floor(r() * 40) : undefined,
      tokenLogo: token.logoURI,
      changePct: isGroup ? r() * 3500 : undefined,
    });
  }
  return items;
}

export interface RichHolder {
  rank: number;
  name: string;
  hue: number;
  holdTime: string;
  positionUsd: number;
  tokenAmount: number;
  pnlUsd: number;
  pnlPct: number;
  avgEntryMc: number;
  avgEntryPrice: number;
  thesis: string;
  thesisLikes: number;
}

export function genRichHolders(token: Token, count = 12): RichHolder[] {
  const r = seeded(hash(token.address) + 23);
  const out: RichHolder[] = [];
  for (let i = 0; i < count; i++) {
    const positionUsd = (50000 / (i + 1)) * (0.6 + r() * 1.2);
    const pnlPct = (r() - 0.25) * 600;
    const pnlUsd = positionUsd * (pnlPct / 100);
    out.push({
      rank: i + 1,
      name: NAMES[(i + 3) % NAMES.length],
      hue: Math.floor(r() * 360),
      holdTime: `${1 + Math.floor(r() * 14)}d ${Math.floor(r() * 23)}h`,
      positionUsd,
      tokenAmount: positionUsd / token.price,
      pnlUsd,
      pnlPct,
      avgEntryMc: token.marketCap * (0.1 + r() * 0.6),
      avgEntryPrice: token.price * (0.1 + r() * 0.7),
      thesis: THESES[Math.floor(r() * THESES.length)],
      thesisLikes: Math.floor(r() * 40),
    });
  }
  return out;
}

export function hue(name: string) {
  return hash(name) % 360;
}

// Decorate a REAL holder (address + amount + %) with the social extras fomo
// shows (PnL / avg entry / thesis). These extras are deterministic estimates
// keyed off the wallet — BirdEye's free tier doesn't expose per-wallet PnL.
export function holderExtras(owner: string) {
  const r = seeded(hash(owner) + 5);
  const pnlPct = (r() - 0.25) * 600;
  return {
    hue: Math.floor(r() * 360),
    holdTime: `${1 + Math.floor(r() * 14)}d ${Math.floor(r() * 23)}h`,
    pnlPct,
    avgEntryFactor: 0.1 + r() * 0.7,
    thesis: THESES[Math.floor(r() * THESES.length)],
    thesisLikes: Math.floor(r() * 40),
  };
}
