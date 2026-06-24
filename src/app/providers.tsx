"use client";

import React, { createContext, useContext } from "react";
import { PrivyProvider } from "@privy-io/react-auth";

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

// Lets components know whether real Privy is wired or we're in demo mode.
export const PrivyReadyContext = createContext<boolean>(false);
export const usePrivyConfigured = () => useContext(PrivyReadyContext);

export function Providers({ children }: { children: React.ReactNode }) {
  // If no app id is configured, render children without Privy so the app
  // still builds and runs. The Connect button shows a "configure Privy" hint.
  if (!APP_ID) {
    return (
      <PrivyReadyContext.Provider value={false}>
        {children}
      </PrivyReadyContext.Provider>
    );
  }

  return (
    <PrivyReadyContext.Provider value={true}>
      <PrivyProvider
        appId={APP_ID}
        config={{
          appearance: {
            theme: "dark",
            accentColor: "#D7FF3E",
            logo: undefined,
          },
          loginMethods: ["google", "apple", "email", "wallet"],
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
        }}
      >
        {children}
      </PrivyProvider>
    </PrivyReadyContext.Provider>
  );
}
