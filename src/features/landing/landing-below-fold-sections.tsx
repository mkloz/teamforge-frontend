import { CtaSection } from "@/features/landing/components/cta";
import { Footer } from "@/features/landing/components/footer";
import { GroupFeelsRightSection } from "@/features/landing/components/group-feels-right";
import { PeopleProblemSection } from "@/features/landing/components/people-problem";
import { PlanToGroupSection } from "@/features/landing/components/plan-to-group";
import { TrustControlSection } from "@/features/landing/components/trust-control";
import { WhyDifferentSection } from "@/features/landing/components/why-different";

export function LandingBelowFoldSections() {
  return (
    <>
      <PeopleProblemSection />
      <PlanToGroupSection />
      <WhyDifferentSection />
      <GroupFeelsRightSection />
      <TrustControlSection />
      <CtaSection />
      <Footer />
    </>
  );
}
