import { useLandingSEO } from "@/features/landing/hooks/use-landing-seo";
import { LandingPageContent } from "@/features/landing/landing-page-content";

export function LandingPage() {
  useLandingSEO();

  return <LandingPageContent />;
}
