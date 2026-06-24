import { NextResponse } from "next/server";
import { fetchTrending, hasBirdeye } from "@/lib/birdeye";
import { MOCK_TOKENS } from "@/lib/mock";

export const revalidate = 20;

export async function GET() {
  if (hasBirdeye()) {
    try {
      const tokens = await fetchTrending(20);
      if (tokens.length) {
        return NextResponse.json({ source: "birdeye", tokens });
      }
    } catch (e) {
      // fall through to mock
    }
  }
  return NextResponse.json({ source: "mock", tokens: MOCK_TOKENS });
}
