import { AboutSection } from "./components/about-section";
import { AlgorithmSection } from "./components/algorithm-section";
import { CtaSection } from "./components/cta-section";
import { FeaturesSection } from "./components/features-section";
import { Footer } from "./components/footer";
import { HeroSection } from "./components/hero-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { Navbar } from "./components/navbar";

export function LandingPage() {
  return (
    <div className="font-sans antialiased">
      <Navbar />

      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AlgorithmSection />
        <AboutSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
