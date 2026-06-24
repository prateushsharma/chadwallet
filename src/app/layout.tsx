import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://chadwallet.app"
  ),
  title: "ChadWallet — Find the next 100x memecoins",
  description:
    "Fast trading in seconds. Buy trending Solana tokens 24/7, follow top traders in real time, and never miss the next breakout. Self-custody, sign in with Apple or Google.",
  icons: {
    icon: "/brand/chad-head.png",
    apple: "/brand/chad-head.png",
  },
  openGraph: {
    title: "ChadWallet — Find the next 100x memecoins",
    description:
      "Fast trading in seconds. Buy trending Solana tokens 24/7 and never miss the next breakout.",
    images: ["/shots/token.png"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020817",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
