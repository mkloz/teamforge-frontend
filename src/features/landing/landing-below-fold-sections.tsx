import { AboutSection } from "@/features/landing/components/about";
import { AlgorithmSection } from "@/features/landing/components/algorithm";
import { CtaSection } from "@/features/landing/components/cta";
import { Footer } from "@/features/landing/components/footer";
import { HowItWorksSection } from "@/features/landing/components/how-it-works";

export function LandingBelowFoldSections() {
  return (
    <>
      <HowItWorksSection />
      <AlgorithmSection />
      <AboutSection />
      <CtaSection />
      <Footer />
    </>
  );
}
