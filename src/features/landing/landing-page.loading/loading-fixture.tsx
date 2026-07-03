import {
  GroupFeelsRightLoadingSection,
  LandingCtaLoadingSection,
  LandingHeroLoadingSection,
  PeopleProblemLoadingSection,
  PlanToGroupLoadingSection,
  TrustControlLoadingSection,
  WhyDifferentLoadingSection,
} from "@/features/landing/landing-page.loading/loading-sections";
import {
  LandingLoadingFooter,
  LandingLoadingHeader,
  LandingLoadingProgress,
} from "@/features/landing/landing-page.loading/loading-shell";

export function LandingPageLoadingFixture() {
  return (
    <div aria-busy="true" className="bg-canvas font-sans text-ink antialiased">
      <output className="sr-only">Loading TeamForge</output>
      <LandingLoadingHeader />
      <LandingLoadingProgress />
      <main id="main-content">
        <LandingHeroLoadingSection />
        <PeopleProblemLoadingSection />
        <PlanToGroupLoadingSection />
        <WhyDifferentLoadingSection />
        <GroupFeelsRightLoadingSection />
        <TrustControlLoadingSection />
        <LandingCtaLoadingSection />
      </main>

      <LandingLoadingFooter />
    </div>
  );
}
