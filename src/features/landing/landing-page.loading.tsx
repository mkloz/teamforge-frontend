import { LandingPageContent } from "@/features/landing/landing-page-content";
import {
  GeneratedPageLoading,
  type PageLoadingProps,
} from "@/shared/components/loading/page-loading";

export const LANDING_PAGE_SKELETON_NAME = "landing.page";

export function LandingPageLoading(_props: PageLoadingProps = {}) {
  const fixture = <LandingPageLoadingFixture />;

  return (
    <GeneratedPageLoading name={LANDING_PAGE_SKELETON_NAME} fixture={fixture}>
      {fixture}
    </GeneratedPageLoading>
  );
}

export function LandingPageLoadingFixture() {
  return <LandingPageContent />;
}
