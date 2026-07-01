import { NextResponse } from "next/server";
import { fetchTokenOverview, hasBirdeye } from "@/lib/birdeye";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  if (!hasBirdeye())
    return NextResponse.json({ source: "error", error: "BIRDEYE_API_KEY missing", token: null });
  try {
    const token = await fetchTokenOverview(params.address);
    return NextResponse.json({ source: "birdeye", token });
  } catch (e) {
    console.error("[api/token]", (e as Error).message);
    return NextResponse.json({ source: "error", error: (e as Error).message, token: null });
  }
}
