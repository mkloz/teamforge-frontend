import { HeroSection } from "@/features/landing/components/hero";
import { Navbar } from "@/features/landing/components/navbar";
import { SideNav } from "@/features/landing/components/side-nav";
import { DeferredLandingBelowFoldSections } from "@/features/landing/deferred-landing-below-fold-sections";

export function LandingPageContent() {
  return (
    <div className="bg-canvas font-sans text-ink antialiased">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-100 -translate-y-24 rounded-lg bg-forge-teal px-4 py-2 text-white opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <SideNav />

      <main id="main-content">
        <HeroSection />
        <DeferredLandingBelowFoldSections />
      </main>
    </div>
  );
}
