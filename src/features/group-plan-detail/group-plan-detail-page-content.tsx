import { lazy, type Ref, Suspense, useEffect, useRef, useState } from "react";
import { GroupSection } from "@/features/group-plan-detail/components/content/group-section";
import { PitchSection } from "@/features/group-plan-detail/components/content/pitch-section";
import { PlanSection } from "@/features/group-plan-detail/components/content/plan-section";
import { GroupPlanHero } from "@/features/group-plan-detail/components/hero/group-plan-hero";
import { MobileActionDock } from "@/features/group-plan-detail/components/mobile-action-dock";
import { DecisionRail } from "@/features/group-plan-detail/components/rail/decision-rail";
import { useGroupPlanDetailCollapsibleHero } from "@/features/group-plan-detail/hooks/use-group-plan-detail-collapsible-hero";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { GroupPlanDetailRouteSearch } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import {
  SkeletonAvatar,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

const LazyGroupPlanDetailDeferredSections = lazy(() =>
  import(
    "@/features/group-plan-detail/group-plan-detail-deferred-sections"
  ).then((module) => ({
    default: module.GroupPlanDetailDeferredSections,
  })),
);

interface GroupPlanDetailPageContentProps {
  detail: GroupPlanDetail;
  isPlanHighlighted?: boolean;
  planSectionRef?: Ref<HTMLElement>;
  search: GroupPlanDetailRouteSearch;
}

interface GroupPlanSectionFocusProps {
  isPlanHighlighted: boolean;
  planSectionRef?: Ref<HTMLElement>;
}

export function GroupPlanDetailPageContent({
  detail,
  isPlanHighlighted = false,
  planSectionRef,
  search,
}: GroupPlanDetailPageContentProps) {
  const focus = {
    isPlanHighlighted,
    planSectionRef,
  };

  return (
    <>
      <GroupPlanDetailPageShell detail={detail} focus={focus} search={search} />
      <MobileActionDock detail={detail} />
    </>
  );
}

function GroupPlanDetailPageShell({
  detail,
  focus,
  search,
}: {
  detail: GroupPlanDetail;
  focus: GroupPlanSectionFocusProps;
  search: GroupPlanDetailRouteSearch;
}) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const { isCompactVisible } = useGroupPlanDetailCollapsibleHero({
    ref: shellRef,
  });

  return (
    <div
      ref={shellRef}
      className="mx-auto w-full max-w-5xl overflow-x-clip px-4 pt-3 pb-app-bottom-dock [--group-detail-compact-opacity:0] [--group-detail-compact-y:-8px] [--group-detail-cover-collapsed-height:72px] [--group-detail-cover-expanded-height:280px] [--group-detail-cover-image-scale:1] [--group-detail-cover-image-y:0px] [--group-detail-cover-original-delay:0ms] [--group-detail-cover-original-opacity:1] [--group-detail-cover-original-y:0px] [--group-detail-cover-y:0px] sm:px-5 md:pt-6 md:pb-12 lg:px-8 sm:[--group-detail-cover-expanded-height:340px] md:[--group-detail-cover-expanded-height:400px] lg:[--group-detail-cover-expanded-height:440px]"
    >
      <GroupPlanHero
        detail={detail}
        isCompactVisible={isCompactVisible}
        search={search}
      />
      <GroupPlanPitch detail={detail} />
      <GroupPlanDetailGrid detail={detail} focus={focus} />
    </div>
  );
}

function GroupPlanPitch({ detail }: { detail: GroupPlanDetail }) {
  return (
    <div className="mt-8 mb-10">
      <PitchSection detail={detail} />
    </div>
  );
}

function GroupPlanDetailGrid({
  detail,
  focus,
}: {
  detail: GroupPlanDetail;
  focus: GroupPlanSectionFocusProps;
}) {
  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)]">
      <GroupPlanMainSections detail={detail} focus={focus} />

      <aside className="min-w-0 border-border/70 lg:border-l lg:pl-8 xl:pl-10">
        <DecisionRail detail={detail} />
      </aside>
    </div>
  );
}

function GroupPlanMainSections({
  detail,
  focus,
}: {
  detail: GroupPlanDetail;
  focus: GroupPlanSectionFocusProps;
}) {
  return (
    <main className="flex min-w-0 flex-col gap-12">
      <GroupSection detail={detail} />
      <PlanSection
        detail={detail}
        isHighlighted={focus.isPlanHighlighted}
        sectionRef={focus.planSectionRef}
      />
      <DeferredMainSections detail={detail} />
    </main>
  );
}

function DeferredMainSections({ detail }: { detail: GroupPlanDetail }) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      return undefined;
    }

    const sentinel = sentinelRef.current;

    if (!sentinel || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />
      {shouldRender ? (
        <Suspense fallback={<DeferredMainSectionsSkeleton />}>
          <LazyGroupPlanDetailDeferredSections detail={detail} />
        </Suspense>
      ) : (
        <DeferredMainSectionsSkeleton />
      )}
    </>
  );
}

function DeferredMainSectionsSkeleton() {
  return (
    <>
      <section className="border-border/70 border-b pb-9" aria-hidden="true">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <Skeleton className="h-8 w-64 max-w-full md:h-9" />
            <SkeletonText
              className="mt-2 max-w-2xl"
              lines={2}
              widths={["w-full", "w-3/4"]}
            />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="mt-6 grid gap-1.5 sm:grid-cols-2">
          {["one", "two", "three", "four"].map((item, index) => (
            <div
              key={item}
              className={`flex min-w-0 items-center gap-3 px-2 py-2 ${index === 0 ? "bg-forge-teal/5" : ""}`}
            >
              <SkeletonAvatar
                className="size-10"
                tone={index === 0 ? "teal" : "default"}
              />
              <SkeletonText
                className="min-w-0 flex-1"
                lines={2}
                widths={["w-32", "w-36"]}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/70 border-b pb-9" aria-hidden="true">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <Skeleton className="h-8 w-72 max-w-full md:h-9" />
            <SkeletonText
              className="mt-2 max-w-2xl"
              lines={2}
              widths={["w-full", "w-3/4"]}
            />
          </div>
          <Skeleton shape="pill" className="h-10 w-18" tone="teal" />
        </div>
        <div className="mt-6 grid gap-1 sm:grid-cols-2">
          {["interests", "pace", "location", "reliability"].map(
            (item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl p-2.5"
              >
                <Skeleton
                  shape="circle"
                  className="mt-0.5 size-4 shrink-0"
                  tone={
                    index === 0 ? "teal" : index === 1 ? "amber" : "default"
                  }
                />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-2 h-3 w-full" />
                  <Skeleton className="mt-1.5 h-3 w-2/3" />
                </div>
              </div>
            ),
          )}
        </div>
      </section>
    </>
  );
}
