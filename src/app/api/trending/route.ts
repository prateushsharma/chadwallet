import { NextResponse } from "next/server";
import { fetchTrending, hasBirdeye } from "@/lib/birdeye";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (!hasBirdeye())
    return NextResponse.json({ source: "error", error: "BIRDEYE_API_KEY missing", tokens: [] });
  try {
    const tokens = await fetchTrending(20);
    return NextResponse.json({ source: "birdeye", tokens });
  } catch (e) {
    console.error("[api/trending]", (e as Error).message);
    return NextResponse.json({ source: "error", error: (e as Error).message, tokens: [] });
  }
}
