import type { ReactNode } from "react";
import { InterestsCatalogSkeleton } from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer/interests-catalog-skeleton";
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
    <OnboardingLoadingShell maxWidthClassName="max-w-sm">
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
    </OnboardingLoadingShell>
  );
}

function PersonalityLoadingFixture() {
  return (
    <OnboardingLoadingShell maxWidthClassName="max-w-xl">
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
    </OnboardingLoadingShell>
  );
}

function InterestsLoadingFixture() {
  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <aside className="relative hidden h-full flex-1 items-center justify-center overflow-hidden border-r bg-hero-bg lg:flex">
        <OnboardingVisualSkeleton />
      </aside>

      <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-canvas">
        <div className="relative z-10 flex-1 overflow-x-hidden overflow-y-scroll scroll-smooth pb-0">
          <InterestsHeaderSkeleton />

          <div className="flex min-h-full w-full flex-col items-center justify-start py-6 sm:py-0">
            <div className="relative w-full max-w-xl px-4 sm:px-5 lg:px-0">
              <div
                aria-busy="true"
                aria-label="Loading interests"
                className="grid gap-5"
                role="status"
              >
                <span className="sr-only">Loading interests</span>
                <InterestsCatalogSkeleton />
              </div>
            </div>
          </div>
        </div>

        <InterestsFooterSkeleton />
      </main>
    </div>
  );
}

function OnboardingLoadingShell({
  children,
  maxWidthClassName,
}: {
  children: ReactNode;
  maxWidthClassName: "max-w-sm" | "max-w-xl";
}) {
  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div className="relative hidden h-full flex-1 items-center justify-center overflow-hidden border-r bg-hero-bg lg:flex">
        <OnboardingVisualSkeleton />
      </div>

      <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-canvas">
        <div className="relative h-full flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-4 pb-4">
          <main className="relative z-10 flex min-h-full items-start justify-center pt-20 pb-10 lg:items-center lg:py-8">
            <div className={`w-full ${maxWidthClassName} px-2 sm:px-10 lg:p-0`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function OnboardingVisualSkeleton() {
  return (
    <div className="relative flex size-72 items-center justify-center">
      <Skeleton shape="circle" className="absolute inset-8" tone="teal" />
      <Skeleton shape="circle" className="size-24" tone="teal" />
    </div>
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
