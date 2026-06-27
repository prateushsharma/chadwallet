import { NextResponse } from "next/server";
import { beRaw, hasBirdeye } from "@/lib/birdeye";

const SOL = "So11111111111111111111111111111111111111112";

// Open /api/health in the browser to see which BirdEye endpoints your key
// can actually access. "ok:false" with status 401 = bad key; 403/402 = your
// plan/tier doesn't include that endpoint; 429 = rate limited.
export async function GET() {
  if (!hasBirdeye()) {
    return NextResponse.json({
      birdeyeKey: false,
      message:
        "No BIRDEYE_API_KEY detected at runtime. Add it to .env.local and RESTART the dev server (env vars only load on start).",
    });
  }

  const checks: { name: string; path: string; params: Record<string, any> }[] = [
    { name: "trending_v3_list", path: "/defi/v3/token/list", params: { sort_by: "volume_24h_usd", sort_type: "desc", offset: 0, limit: 3, min_liquidity: 5000 } },
    { name: "tokenlist_legacy", path: "/defi/tokenlist", params: { sort_by: "v24hUSD", sort_type: "desc", offset: 0, limit: 3 } },
    { name: "token_overview", path: "/defi/token_overview", params: { address: SOL } },
    { name: "ohlcv", path: "/defi/ohlcv", params: { address: SOL, type: "15m", time_from: Math.floor(Date.now() / 1000) - 86400, time_to: Math.floor(Date.now() / 1000) } },
    { name: "txs_token", path: "/defi/txs/token", params: { address: SOL, tx_type: "swap", sort_type: "desc", offset: 0, limit: 3 } },
    { name: "holder_v3", path: "/defi/v3/token/holder", params: { address: SOL, offset: 0, limit: 3 } },
  ];

  const results: Record<string, any> = {};
  for (const c of checks) {
    try {
      const r = await beRaw(c.path, c.params);
      results[c.name] = {
        ok: r.ok,
        status: r.status,
        sampleKeys: r.json?.data
          ? Object.keys(r.json.data.items?.[0] ?? r.json.data.tokens?.[0] ?? r.json.data)
          : undefined,
        error: r.ok ? undefined : r.text.slice(0, 200),
      };
    } catch (e: any) {
      results[c.name] = { ok: false, error: e?.message ?? "threw" };
    }
    // be gentle with the free-tier 1 req/sec limit
    await new Promise((res) => setTimeout(res, 1100));
  }

  return NextResponse.json({ birdeyeKey: true, results });
}
