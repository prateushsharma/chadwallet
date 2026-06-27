import { NextResponse } from "next/server";
import { fetchTrades, hasBirdeye } from "@/lib/birdeye";
import { findMock, MOCK_TOKENS, mockTrades } from "@/lib/mock";

export const revalidate = 5;

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  if (hasBirdeye()) {
    try {
      const trades = await fetchTrades(params.address, 30);
      if (trades.length) return NextResponse.json({ source: "birdeye", trades });
    } catch (e) {
      console.error("[api/trades] fallback:", (e as Error).message);
    }
  }
  const token = findMock(params.address) ?? MOCK_TOKENS[0];
  return NextResponse.json({ source: "mock", trades: mockTrades(token) });
}
