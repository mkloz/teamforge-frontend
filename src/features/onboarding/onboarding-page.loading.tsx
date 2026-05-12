import {
  InterestsPageContent,
  PersonalityPageContent,
  ProfileBasicsPageContent,
} from "@/features/onboarding/onboarding-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
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
      <div
        aria-label="Loading profile basics"
        className="flex w-full flex-col"
        role="status"
      >
        <span className="sr-only">Loading profile basics</span>
        <div className="mb-6 flex flex-col items-center sm:mb-8">
          <Skeleton className="h-9 w-72 max-w-full sm:h-12" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        </div>

        <div className="flex flex-col gap-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton className="h-24" />
          <SkeletonButton className="mt-4 h-11 w-full" tone="teal" />
        </div>
      </div>
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
      <div
        aria-label="Loading personality"
        className="mt-10 flex flex-1 flex-col"
        role="status"
      >
        <span className="sr-only">Loading personality</span>
        <div className="flex flex-1 flex-col justify-center py-8">
          <Skeleton className="h-3 w-24" tone="teal" />
          <Skeleton className="mt-4 h-10 w-full max-w-lg" />
          <SkeletonText
            className="mt-4 max-w-lg"
            lines={3}
            widths={["w-full", "w-11/12", "w-3/4"]}
          />

          <div className="mt-8 grid gap-3">
            {["strong-no", "no", "neutral", "yes", "strong-yes"].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex min-h-14 items-center gap-3 border-border border-t px-1 py-3 first:border-t-0"
                >
                  <Skeleton
                    shape="circle"
                    className="size-8 shrink-0"
                    tone={index === 2 ? "teal" : "default"}
                  />
                  <Skeleton className="h-4 min-w-0 flex-1" />
                </div>
              ),
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <SkeletonButton className="h-11 w-full sm:w-28" />
            <SkeletonButton className="h-11 w-full sm:w-36" tone="teal" />
          </div>
        </div>
      </div>
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
        className="grid gap-5"
        role="status"
      >
        <span className="sr-only">Loading interests</span>
        <section className="flex flex-col gap-4 pt-2">
          <Skeleton className="h-3 w-24" tone="teal" />
          <Skeleton className="h-9 w-80 max-w-full" />
          <SkeletonText lines={2} widths={["w-full", "w-3/4"]} />
          <div className="flex flex-wrap gap-2">
            {["one", "two", "three", "four"].map((item, index) => (
              <Skeleton
                key={item}
                shape="pill"
                className="h-9 w-24"
                tone={index === 0 ? "teal" : "default"}
              />
            ))}
          </div>
        </section>
        {["culture", "active", "focused"].map((item) => (
          <section key={item} className="border-border/70 border-t pt-5">
            <div className="flex items-start justify-between gap-3">
              <SkeletonText lines={2} widths={["w-40", "w-56"]} />
              <Skeleton shape="circle" className="size-8 shrink-0" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <InterestChoiceSkeleton tone="teal" />
              <InterestChoiceSkeleton />
              <InterestChoiceSkeleton />
              <InterestChoiceSkeleton />
            </div>
          </section>
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

function FormFieldSkeleton({ className }: { className?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className={className ?? "h-12 w-full"} />
    </div>
  );
}

function InterestChoiceSkeleton({
  tone = "default",
}: {
  tone?: "default" | "teal";
}) {
  return (
    <div className="flex h-12 items-center gap-3 rounded-xl border border-border/70 bg-card/50 px-3">
      <Skeleton shape="circle" className="size-5 shrink-0" tone={tone} />
      <Skeleton className="h-3 min-w-0 flex-1" tone={tone} />
    </div>
  );
}
