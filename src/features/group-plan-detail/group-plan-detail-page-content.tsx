import { lazy, type Ref, Suspense, useRef } from "react";
import { GroupPlanOverviewSection } from "@/features/group-plan-detail/components/content/group-plan-overview-section";
import { PlanCommitmentSection } from "@/features/group-plan-detail/components/content/plan-commitment-section";
import { PlanSeatRecoverySection } from "@/features/group-plan-detail/components/content/plan-seat-recovery-section";
import { PrivateAccommodationDialog } from "@/features/group-plan-detail/components/content/private-accommodation-dialog";
import { GroupPlanHero } from "@/features/group-plan-detail/components/hero/group-plan-hero";
import { DecisionRail } from "@/features/group-plan-detail/components/rail/decision-rail";
import {
  GroupPlanFitSectionSkeleton,
  GroupPlanPeopleSectionSkeleton,
} from "@/features/group-plan-detail/group-plan-detail-section-skeletons";
import { useGroupPlanDetailCollapsibleHero } from "@/features/group-plan-detail/hooks/use-group-plan-detail-collapsible-hero";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { useDeferredRender } from "@/shared/hooks/use-deferred-render";
import type { GroupPlanDetailRouteSearch } from "@/shared/navigation";

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
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 pt-3 pb-10 [--group-detail-compact-opacity:0] [--group-detail-compact-y:-8px] [--group-detail-cover-collapsed-height:72px] [--group-detail-cover-expanded-height:300px] [--group-detail-cover-image-scale:1] [--group-detail-cover-image-y:0px] [--group-detail-cover-original-delay:0ms] [--group-detail-cover-original-opacity:1] [--group-detail-cover-original-y:0px] [--group-detail-cover-shell-height:var(--group-detail-cover-expanded-height)] [--group-detail-cover-y:0px] sm:px-5 md:pt-6 md:pb-12 lg:px-8 sm:[--group-detail-cover-expanded-height:380px] md:[--group-detail-cover-expanded-height:450px] lg:[--group-detail-cover-expanded-height:500px]"
    >
      <GroupPlanHero
        detail={detail}
        isCompactVisible={isCompactVisible}
        search={search}
      />
      <GroupPlanDetailGrid detail={detail} focus={focus} />
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
    <div className="mt-10">
      <GroupPlanOverviewSection
        detail={detail}
        isHighlighted={focus.isPlanHighlighted}
        sectionRef={focus.planSectionRef}
      />
      <PlanCommitmentSection detail={detail} />
      <PlanSeatRecoverySection detail={detail} />
      <PrivateAccommodationDialog detail={detail} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)]">
        <div className="min-w-0 border-border/70 lg:col-start-2 lg:row-start-1 lg:border-l lg:pl-8 xl:pl-10">
          <DecisionRail detail={detail} />
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <DeferredMainSections detail={detail} />
        </div>
      </div>
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
