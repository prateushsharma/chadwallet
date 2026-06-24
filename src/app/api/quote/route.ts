import { NextResponse } from "next/server";
import { jupiterQuote } from "@/lib/jupiter";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const inputMint = searchParams.get("inputMint");
  const outputMint = searchParams.get("outputMint");
  const amount = Number(searchParams.get("amount"));
  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  try {
    const quote = await jupiterQuote({ inputMint, outputMint, amount });
    return NextResponse.json({ source: "jupiter", quote });
  } catch (e) {
    return NextResponse.json({ error: "quote failed" }, { status: 502 });
  }
}
