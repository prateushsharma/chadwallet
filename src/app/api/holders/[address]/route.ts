import { NextResponse } from "next/server";
import { fetchHolders, hasBirdeye } from "@/lib/birdeye";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  if (!hasBirdeye())
    return NextResponse.json({ source: "error", error: "BIRDEYE_API_KEY missing", holders: [] });
  try {
    const holders = await fetchHolders(params.address, 30);
    return NextResponse.json({ source: "birdeye", holders });
  } catch (e) {
    console.error("[api/holders]", (e as Error).message);
    return NextResponse.json({ source: "error", error: (e as Error).message, holders: [] });
  }
}
