import { AboutSection } from "@/features/landing/components/about";
import { AlgorithmSection } from "@/features/landing/components/algorithm";
import { CtaSection } from "@/features/landing/components/cta";
import { Footer } from "@/features/landing/components/footer";
import { HeroSection } from "@/features/landing/components/hero";
import { HowItWorksSection } from "@/features/landing/components/how-it-works";
import { Navbar } from "@/features/landing/components/navbar";
import { SideNav } from "@/features/landing/components/side-nav";
import { useLandingSEO } from "@/features/landing/hooks/use-landing-seo";

export function LandingPage() {
  useLandingSEO();

  return (
    <div className="font-sans antialiased bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-forge-teal focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <SideNav />

      <main id="main-content">
        <HeroSection />
        <HowItWorksSection />
        <AlgorithmSection />
        <AboutSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
