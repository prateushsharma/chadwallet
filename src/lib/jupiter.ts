import { QuoteResult } from "./types";

const QUOTE = "https://quote-api.jup.ag/v6/quote";

// Jupiter quote API is free and keyless. Amount is in base units (lamports/atoms).
export async function jupiterQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: number; // base units
  slippageBps?: number;
}): Promise<QuoteResult> {
  const qs = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: String(Math.floor(params.amount)),
    slippageBps: String(params.slippageBps ?? 50),
    onlyDirectRoutes: "false",
  });
  const res = await fetch(`${QUOTE}?${qs}`, { next: { revalidate: 10 } });
  if (!res.ok) throw new Error(`Jupiter quote -> ${res.status}`);
  const j = await res.json();
  const route: string[] =
    j.routePlan?.map((r: any) => r.swapInfo?.label).filter(Boolean) ?? [];
  return {
    inAmount: Number(j.inAmount),
    outAmount: Number(j.outAmount),
    priceImpactPct: Number(j.priceImpactPct ?? 0),
    route,
  };
}

export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
