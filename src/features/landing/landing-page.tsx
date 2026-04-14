import { useLandingSEO } from "./hooks/use-landing-seo";
import { AboutSection } from "./components/about";
import { AlgorithmSection } from "./components/algorithm";
import { CtaSection } from "./components/cta";
import { Footer } from "./components/footer";
import { HeroSection } from "./components/hero";
import { HowItWorksSection } from "./components/how-it-works";
import { Navbar } from "./components/navbar";
import { SideNav } from "./components/side-nav";

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
