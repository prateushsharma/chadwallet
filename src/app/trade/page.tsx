import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { TokenBanner } from "@/components/TokenBanner";
import { TradeTerminal } from "@/components/trade/TradeTerminal";

export default function TradePage() {
  return (
    <main className="relative z-10 min-h-screen">
      <Navbar variant="solid" />
      <TokenBanner speed={40} />
      <Suspense
        fallback={
          <div className="led p-10 text-center text-muted">loading terminal…</div>
        }
      >
        <TradeTerminal />
      </Suspense>
      <TokenBanner reverse speed={48} />
    </main>
  );
}
