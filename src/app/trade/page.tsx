import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { TokenBanner } from "@/components/TokenBanner";
import { TradeTerminal } from "@/components/trade/TradeTerminal";
import { BottomBar } from "@/components/trade/BottomBar";

export default function TradePage() {
  return (
    <main className="relative z-10 flex min-h-screen flex-col">
      <Navbar variant="solid" />
      <TokenBanner speed={40} />
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="led p-10 text-center text-muted">loading terminal…</div>
          }
        >
          <TradeTerminal />
        </Suspense>
      </div>
      <BottomBar />
    </main>
  );
}
