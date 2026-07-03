import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ActivityLanesSection } from "@/features/profile/components/activity-lanes-section";
import { BestFirstGroupStrip } from "@/features/profile/components/best-first-group-strip";
import { GroupFitSection } from "@/features/profile/components/group-fit-section";
import { MatchingSnapshot } from "@/features/profile/components/matching-snapshot";
import type {
  DimensionScore,
  OceanScores,
} from "@/features/profile/lib/profile-contract";
import type { ProfileInsightModel } from "@/features/profile/lib/profile-insights";
import { getBrowserWindow } from "@/shared/lib/browser-environment";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";

const PsychometricsSidebar = lazy(() =>
  import("@/features/profile/components/psychometrics-sidebar").then(
    (module) => ({ default: module.PsychometricsSidebar }),
  ),
);

interface ProfileDeferredInsightsProps {
  dimensionScores: DimensionScore[] | null;
  oceanScores: OceanScores | null;
  profileInsights: ProfileInsightModel;
}

export function ProfileDeferredInsights({
  dimensionScores,
  oceanScores,
  profileInsights,
}: ProfileDeferredInsightsProps) {
  return (
    <>
      <BestFirstGroupStrip activityIdeas={profileInsights.activityIdeas} />

      <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
          <GroupFitSection insight={profileInsights.groupFit} />
          <ActivityLanesSection lanes={profileInsights.activityLanes} />
          <MatchingSnapshot signals={profileInsights.matchingSignals} />
        </div>

        <ProfilePsychometricsPanel
          oceanScores={oceanScores}
          dimensionScores={dimensionScores}
        />
      </div>
    </>
  );
}

function ProfilePsychometricsPanel({
  dimensionScores,
  oceanScores,
}: {
  dimensionScores: DimensionScore[] | null;
  oceanScores: OceanScores | null;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = panelRef.current;
    const IntersectionObserverCtor = getBrowserWindow()?.IntersectionObserver;

    if (!element || shouldRender) {
      return undefined;
    }

    if (!IntersectionObserverCtor) {
      const fallbackTimer = scheduleDelay(() => setShouldRender(true), 800);

      return () => cancelDelay(fallbackTimer);
    }

    const observer = new IntersectionObserverCtor(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div
      ref={panelRef}
      className="flex min-w-0 shrink-0 flex-col border-border/70 lg:sticky lg:top-(--profile-sidebar-sticky-top) lg:self-start lg:border-l lg:pl-8 xl:pl-10"
    >
      {shouldRender ? (
        <Suspense fallback={<ProfilePsychometricsFallback />}>
          <PsychometricsSidebar
            oceanScores={oceanScores}
            dimensionScores={dimensionScores}
          />
        </Suspense>
      ) : (
        <ProfilePsychometricsFallback />
      )}
    </div>
  );
}

function ProfilePsychometricsFallback() {
  return (
    <aside className="grid w-full gap-8 md:grid-cols-2 lg:flex lg:flex-col lg:gap-10">
      <section className="flex min-w-0 flex-col border-border/60 border-t pt-6 lg:border-t-0 lg:pt-0">
        <div className="relative mx-auto aspect-square w-full max-w-72">
          <div className="absolute top-1/2 left-1/2 h-px w-4/5 -translate-x-1/2 -translate-y-1/2 rotate-12 bg-border" />
          <div className="absolute top-1/2 left-1/2 h-px w-4/5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-border" />
          <div className="absolute top-1/2 left-1/2 h-px w-4/5 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-border" />
          <div className="absolute inset-12 rounded-full border border-border/70" />
          <div className="absolute inset-20 rounded-full border border-border/60" />
          <div className="absolute inset-x-16 top-16 bottom-16 rounded-full border-2 border-forge-teal/30" />
        </div>
      </section>
      <section className="flex flex-col gap-5">
        <div className="h-3 w-32 rounded-full bg-forge-teal/15" />
        {["mind", "energy", "nature", "tactics"].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-muted" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-20 rounded-full bg-muted" />
              <div className="mt-2 h-2.5 w-full rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </section>
    </aside>
  );
}
