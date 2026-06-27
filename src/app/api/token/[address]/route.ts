import { NextResponse } from "next/server";
import { fetchTokenOverview, hasBirdeye } from "@/lib/birdeye";
import { findMock, MOCK_TOKENS } from "@/lib/mock";

export const revalidate = 20;

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  if (hasBirdeye()) {
    try {
      const token = await fetchTokenOverview(params.address);
      if (token?.address) return NextResponse.json({ source: "birdeye", token });
    } catch (e) {
      console.error("[api/token] fallback:", (e as Error).message);
    }
  }
  return NextResponse.json({ source: "mock", token: findMock(params.address) ?? MOCK_TOKENS[0] });
}
