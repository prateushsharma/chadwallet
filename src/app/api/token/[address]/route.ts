import { NextResponse } from "next/server";
import { fetchTokenOverview, hasBirdeye } from "@/lib/birdeye";
import { findMock, MOCK_TOKENS } from "@/lib/mock";

export const revalidate = 20;

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  if (hasBirdeye()) {
    try {
      const token = await fetchTokenOverview(address);
      if (token?.address) return NextResponse.json({ source: "birdeye", token });
    } catch {}
  }
  const token = findMock(address) ?? MOCK_TOKENS[0];
  return NextResponse.json({ source: "mock", token });
}
