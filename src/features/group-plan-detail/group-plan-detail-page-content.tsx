import { lazy, type Ref, Suspense, useRef } from "react";
import { GroupSection } from "@/features/group-plan-detail/components/content/group-section";
import { PitchSection } from "@/features/group-plan-detail/components/content/pitch-section";
import { PlanSection } from "@/features/group-plan-detail/components/content/plan-section";
import { GroupPlanHero } from "@/features/group-plan-detail/components/hero/group-plan-hero";
import { DecisionRail } from "@/features/group-plan-detail/components/rail/decision-rail";
import {
  GroupPlanFitSectionSkeleton,
  GroupPlanPeopleSectionSkeleton,
} from "@/features/group-plan-detail/group-plan-detail-section-skeletons";
import { useGroupPlanDetailCollapsibleHero } from "@/features/group-plan-detail/hooks/use-group-plan-detail-collapsible-hero";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { GroupPlanDetailRouteSearch } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { useDeferredRender } from "@/shared/hooks/use-deferred-render";

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
    <GroupPlanDetailPageShell detail={detail} focus={focus} search={search} />
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
      className="mx-auto w-full max-w-5xl overflow-x-clip px-4 pt-3 pb-10 [--group-detail-compact-opacity:0] [--group-detail-compact-y:-8px] [--group-detail-cover-collapsed-height:72px] [--group-detail-cover-expanded-height:280px] [--group-detail-cover-image-scale:1] [--group-detail-cover-image-y:0px] [--group-detail-cover-original-delay:0ms] [--group-detail-cover-original-opacity:1] [--group-detail-cover-original-y:0px] [--group-detail-cover-y:0px] sm:px-5 md:pt-6 md:pb-12 lg:px-8 sm:[--group-detail-cover-expanded-height:340px] md:[--group-detail-cover-expanded-height:400px] lg:[--group-detail-cover-expanded-height:440px]"
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
    <div className="flex min-w-0 flex-col gap-12">
      <GroupSection detail={detail} />
      <PlanSection
        detail={detail}
        isHighlighted={focus.isPlanHighlighted}
        sectionRef={focus.planSectionRef}
      />
      <DeferredMainSections detail={detail} />
    </div>
  );
}

function DeferredMainSections({ detail }: { detail: GroupPlanDetail }) {
  const { sentinelRef, shouldRender } = useDeferredRender({
    rootMargin: "240px 0px",
  });

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
      <GroupPlanPeopleSectionSkeleton aria-hidden />
      <GroupPlanFitSectionSkeleton aria-hidden showStrengthDots={false} />
    </>
  );
}
