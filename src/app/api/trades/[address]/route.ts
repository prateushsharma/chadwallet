import { NextResponse } from "next/server";
import { fetchTrades, hasBirdeye } from "@/lib/birdeye";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  if (!hasBirdeye())
    return NextResponse.json({ source: "error", error: "BIRDEYE_API_KEY missing", trades: [] });
  try {
    const trades = await fetchTrades(params.address, 40);
    return NextResponse.json({ source: "birdeye", trades });
  } catch (e) {
    console.error("[api/trades]", (e as Error).message);
    return NextResponse.json({ source: "error", error: (e as Error).message, trades: [] });
  }
}
