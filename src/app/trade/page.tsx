import { Suspense } from "react";
import { TerminalNav } from "@/components/trade/TerminalNav";
import { TradeTerminal } from "@/components/trade/TradeTerminal";
import { BottomBar } from "@/components/trade/BottomBar";

export default function TradePage() {
  return (
    <main className="relative z-10 flex h-screen flex-col overflow-hidden">
      <TerminalNav />
      <div className="min-h-0 flex-1">
        <Suspense
          fallback={<div className="led p-10 text-center text-muted">loading terminal…</div>}
        >
          <TradeTerminal />
        </Suspense>
      </div>
      <BottomBar />
    </main>
  );
}
