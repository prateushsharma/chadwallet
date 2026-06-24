import { NextResponse } from "next/server";
import { fetchCandles, hasBirdeye } from "@/lib/birdeye";
import { findMock, MOCK_TOKENS, mockCandles } from "@/lib/mock";

export const revalidate = 20;

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  if (hasBirdeye()) {
    try {
      const candles = await fetchCandles(address);
      if (candles.length) return NextResponse.json({ source: "birdeye", candles });
    } catch {}
  }
  const token = findMock(address) ?? MOCK_TOKENS[0];
  return NextResponse.json({ source: "mock", candles: mockCandles(token) });
}
