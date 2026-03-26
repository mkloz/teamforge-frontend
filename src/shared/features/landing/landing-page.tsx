import { AboutSection } from "./components/about";
import { AlgorithmSection } from "./components/algorithm";
import { CtaSection } from "./components/cta";
import { FeaturesSection } from "./components/features";
import { Footer } from "./components/footer";
import { HeroSection } from "./components/hero";
import { HowItWorksSection } from "./components/how-it-works";
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
