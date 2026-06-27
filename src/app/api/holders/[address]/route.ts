import { NextResponse } from "next/server";
import { fetchHolders, hasBirdeye } from "@/lib/birdeye";
import { findMock, MOCK_TOKENS, mockHolders } from "@/lib/mock";

export const revalidate = 30;

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  if (hasBirdeye()) {
    try {
      const holders = await fetchHolders(params.address, 20);
      if (holders.length) return NextResponse.json({ source: "birdeye", holders });
    } catch (e) {
      console.error("[api/holders] fallback (holder API needs Starter tier):", (e as Error).message);
    }
  }
  const token = findMock(params.address) ?? MOCK_TOKENS[0];
  return NextResponse.json({ source: "mock", holders: mockHolders(token) });
}
