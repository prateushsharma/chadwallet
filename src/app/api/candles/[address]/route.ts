import { NextResponse } from "next/server";
import { fetchCandles, hasBirdeye } from "@/lib/birdeye";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: { address: string } }) {
  const type = new URL(req.url).searchParams.get("type") || "15m";
  if (!hasBirdeye())
    return NextResponse.json({ source: "error", error: "BIRDEYE_API_KEY missing", candles: [] });
  try {
    const candles = await fetchCandles(params.address, type);
    return NextResponse.json({ source: "birdeye", candles });
  } catch (e) {
    console.error("[api/candles]", (e as Error).message);
    return NextResponse.json({ source: "error", error: (e as Error).message, candles: [] });
  }
}
