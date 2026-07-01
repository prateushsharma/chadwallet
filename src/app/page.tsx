import { Navbar } from "@/components/Navbar";
import { TokenBanner } from "@/components/TokenBanner";
import { Hero } from "@/components/Hero";
import { Showcase } from "@/components/Showcase";
import { FomoCards } from "@/components/FomoCards";
import { Community } from "@/components/Community";
import { Footer } from "@/components/Download";

export default function HomePage() {
  return (
    <main className="relative z-10">
      {/* Top rotating token banner */}
      <TokenBanner />
      {/* Hero with overlaid navbar */}
      <div className="relative">
        <Navbar variant="overlay" />
        <Hero />
      </div>
      <Showcase />
      <FomoCards />
      <Community />
      {/* Bottom rotating token banner */}
      <TokenBanner reverse speed={52} />
      <Footer />
    </main>
  );
}
