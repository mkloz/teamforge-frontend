import {
  InterestsPageContent,
  PersonalityPageContent,
  ProfileBasicsPageContent,
} from "@/features/onboarding/onboarding-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonCard,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

type OnboardingLoadingStep = "interests" | "personality" | "profile";

interface OnboardingPageLoadingProps extends PageLoadingProps {
  step: OnboardingLoadingStep;
}

const ONBOARDING_LOADING_NAMES = {
  interests: "onboarding.interests-page",
  personality: "onboarding.personality-page",
  profile: "onboarding.profile-page",
} satisfies Record<OnboardingLoadingStep, string>;

export function OnboardingPageLoading({ step }: OnboardingPageLoadingProps) {
  void ONBOARDING_LOADING_NAMES[step];
  return <OnboardingPageLoadingFixture step={step} />;
}

export function OnboardingPageLoadingFixture({
  step,
}: Pick<OnboardingPageLoadingProps, "step">) {
  if (step === "profile") {
    return <ProfileBasicsLoadingFixture />;
  }

  if (step === "personality") {
    return <PersonalityLoadingFixture />;
  }

  return <InterestsLoadingFixture />;
}

function ProfileBasicsLoadingFixture() {
  return (
    <ProfileBasicsPageContent progress={0.24}>
      <SkeletonCard
        aria-label="Loading profile basics"
        className="p-6"
        role="status"
      >
        <span className="sr-only">Loading profile basics</span>
        <SkeletonText lines={3} widths={["w-24", "w-56", "w-full"]} />
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <SkeletonButton className="h-12 w-full" tone="teal" />
        </div>
      </SkeletonCard>
    </ProfileBasicsPageContent>
  );
}

function PersonalityLoadingFixture() {
  return (
    <PersonalityPageContent
      catalystProgress={0.5}
      displayProgress={0.5}
      hasTopPadding
      showHomeLink
    >
      <SkeletonCard
        aria-label="Loading personality"
        className="mt-10 p-6"
        role="status"
      >
        <span className="sr-only">Loading personality</span>
        <SkeletonText lines={3} widths={["w-28", "w-full", "w-4/5"]} />
        <div className="mt-6 grid gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </SkeletonCard>
    </PersonalityPageContent>
  );
}

function InterestsLoadingFixture() {
  return (
    <InterestsPageContent
      progress={0.5}
      header={<InterestsHeaderSkeleton />}
      footer={<InterestsFooterSkeleton />}
    >
      <div
        aria-busy="true"
        aria-label="Loading interests"
        className="grid gap-4"
        role="status"
      >
        <span className="sr-only">Loading interests</span>
        <SkeletonCard className="p-4">
          <SkeletonText lines={2} widths={["w-32", "w-72"]} />
          <div className="mt-4 flex flex-wrap gap-2">
            {["one", "two", "three", "four"].map((item, index) => (
              <Skeleton
                key={item}
                shape="pill"
                className="h-9 w-24"
                tone={index === 0 ? "teal" : "default"}
              />
            ))}
          </div>
        </SkeletonCard>
        {["culture", "active", "focused"].map((item) => (
          <SkeletonCard key={item} className="p-4">
            <SkeletonText lines={2} widths={["w-40", "w-56"]} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </InterestsPageContent>
  );
}

function InterestsHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-30 border-border border-b bg-canvas/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <SkeletonText className="flex-1" lines={2} widths={["w-28", "w-44"]} />
        <Skeleton shape="pill" className="h-8 w-20" tone="teal" />
      </div>
    </div>
  );
}

function InterestsFooterSkeleton() {
  return (
    <footer className="border-border border-t bg-card p-4">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <SkeletonButton className="w-24" />
        <SkeletonButton className="w-32" tone="teal" />
      </div>
    </footer>
  );
}
