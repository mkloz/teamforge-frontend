import { useEffect } from "react";
import { HeroSection } from "@/features/landing/components/hero";
import { SideNav } from "@/features/landing/components/side-nav";
import { DeferredLandingBelowFoldSections } from "@/features/landing/deferred-landing-below-fold-sections";
import { useLandingScrollSnap } from "@/features/landing/hooks/use-landing-scroll-snap";
import { scrollToLandingSection } from "@/shared/components/public-site/landing-scroll";
import {
  LANDING_SECTIONS,
  type LandingSectionId,
} from "@/shared/components/public-site/landing-sections";
import { Navbar } from "@/shared/components/public-site/public-site-shell";

function isLandingSectionId(id: string): id is LandingSectionId {
  return LANDING_SECTIONS.some((section) => section.id === id);
}

export function LandingPageContent() {
  useLandingScrollSnap();

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const targetId = window.location.hash.slice(1);

    if (!isLandingSectionId(targetId)) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      scrollToLandingSection(targetId, {
        behavior: "auto",
        block: "start",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="bg-canvas font-sans text-ink antialiased">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-100 -translate-y-24 rounded-lg bg-primary px-4 py-2 text-white opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:outline-none"
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
