import { NextResponse } from "next/server";
import { fetchCandles, hasBirdeye } from "@/lib/birdeye";
import { findMock, MOCK_TOKENS, mockCandles } from "@/lib/mock";

export const revalidate = 20;

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  if (hasBirdeye()) {
    try {
      const candles = await fetchCandles(params.address);
      if (candles.length) return NextResponse.json({ source: "birdeye", candles });
    } catch (e) {
      console.error("[api/candles] fallback:", (e as Error).message);
    }
  }
  const token = findMock(params.address) ?? MOCK_TOKENS[0];
  return NextResponse.json({ source: "mock", candles: mockCandles(token) });
}
