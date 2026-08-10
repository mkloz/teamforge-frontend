import type { ReactNode } from "react";
import { OnboardingHomeLink } from "@/features/onboarding/components/onboarding-home-link";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

type OnboardingLoadingStep = "intent" | "interests" | "personality" | "profile";

interface OnboardingPageLoadingProps extends PageLoadingProps {
  step: OnboardingLoadingStep;
}

const ONBOARDING_LOADING_NAMES = {
  interests: "onboarding.interests-page",
  intent: "onboarding.intent-page",
  personality: "onboarding.personality-page",
  profile: "onboarding.profile-page",
} satisfies Record<OnboardingLoadingStep, string>;

export function OnboardingPageLoading({ step }: OnboardingPageLoadingProps) {
  void ONBOARDING_LOADING_NAMES[step];
  return <OnboardingPageLoadingFixture step={step} />;
}

function OnboardingPageLoadingFixture({
  step,
}: Pick<OnboardingPageLoadingProps, "step">) {
  if (step === "profile" || step === "intent") {
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
      <div aria-busy="true" className="flex w-full flex-col">
        <output className="sr-only">Loading profile basics</output>
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
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <BackgroundTexture />
        <OnboardingHomeLink />

        <div className="relative h-full flex-1 overflow-y-auto overflow-x-hidden">
          <div className="absolute top-0 right-0 left-0 z-50">
            <TopProgressBar progress={0} />
          </div>

          <div className="relative flex min-h-full flex-col items-center justify-start px-4 pt-7 pb-4 sm:px-6 sm:pt-12">
            <div className="relative flex w-full max-w-xl flex-1 flex-col">
              <div aria-busy="true" className="flex flex-1 flex-col">
                <output className="sr-only">Loading personality</output>
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
                    <SkeletonButton
                      className="h-11 w-full sm:w-36"
                      tone="teal"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden h-full flex-1 items-center justify-center overflow-hidden border-l bg-hero-bg lg:flex">
        <OnboardingVisualSkeleton />
      </div>
    </div>
  );
}

function InterestsLoadingFixture() {
  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <aside className="relative hidden h-full flex-1 items-center justify-center overflow-hidden border-r bg-hero-bg lg:flex">
        <OnboardingVisualSkeleton />
      </aside>

      <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-canvas">
        <BackgroundTexture />

        <div className="relative z-10 flex-1 overflow-x-hidden overflow-y-scroll pb-0">
          <TopProgressBar
            progress={0}
            className="sticky top-0 z-50 -mx-4 -mt-1 w-full sm:-mx-5"
          />

          <div className="flex min-h-full w-full flex-col items-center justify-start py-6 sm:py-0">
            <div className="relative w-full max-w-xl px-4 sm:px-5 lg:px-0">
              <div aria-busy="true" className="relative w-full">
                <output className="sr-only">Loading interests</output>
                <InterestsIntroSkeleton />
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
        <BackgroundTexture />
        <OnboardingHomeLink />

        <div className="relative h-full flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
          <TopProgressBar
            progress={0}
            className="sticky top-0 z-50 -mx-4 -mt-2 w-full"
          />

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

function InterestsIntroSkeleton() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center gap-0 pt-10 text-center sm:pt-12">
      <Skeleton className="mb-4 h-8 w-full max-w-80 sm:h-12" />
      <SkeletonText
        className="mb-3 w-full"
        lines={3}
        widths={["w-full", "w-11/12", "w-4/5"]}
      />
      <SkeletonText
        className="mb-6 w-full"
        lines={2}
        widths={["w-full", "w-3/4"]}
      />

      <Skeleton className="mb-6 h-px w-full" />

      <div className="mb-8 flex w-full flex-col gap-4 text-left">
        {["first", "second", "third"].map((item, index) => (
          <div key={item} className="flex items-start gap-3.5">
            <Skeleton
              shape="square"
              className="mt-0.5 size-8 shrink-0 rounded-lg"
              tone={index === 0 ? "teal" : "default"}
            />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={2}
              widths={["w-full", "w-4/5"]}
            />
          </div>
        ))}
      </div>

      <div className="mt-auto flex w-full xs:flex-row flex-col-reverse xs:items-center items-stretch gap-3 pt-6">
        <SkeletonButton className="h-10 w-full xs:w-36" />
        <SkeletonButton className="h-10 w-full xs:flex-1" tone="teal" />
      </div>
    </div>
  );
}

function InterestsFooterSkeleton() {
  return (
    <footer className="relative z-30 w-full shrink-0 border-slate-muted/10 border-t bg-canvas">
      <div className="mx-auto w-full max-w-xl px-4 sm:px-5 lg:px-0" />
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
