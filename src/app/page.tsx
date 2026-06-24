import { Navbar } from "@/components/Navbar";
import { TokenBanner } from "@/components/TokenBanner";
import { Hero } from "@/components/Hero";
import { Showcase } from "@/components/Showcase";
import { Features } from "@/components/Features";
import { Download, Footer } from "@/components/Download";

export default function HomePage() {
  return (
    <main className="relative z-10">
      <Navbar />
      {/* Top rotating banner */}
      <TokenBanner />
      <Hero />
      <Showcase />
      <Features />
      <Download />
      {/* Bottom rotating banner (opposite direction) */}
      <TokenBanner reverse speed={52} />
      <Footer />
    </main>
  );
}
