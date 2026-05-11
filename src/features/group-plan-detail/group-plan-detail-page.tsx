import { useParams, useSearch } from "@tanstack/react-router";
import { GroupPlanDetailPageLoading } from "@/features/group-plan-detail/group-plan-detail-page.loading";
import { GroupPlanDetailPageContent } from "@/features/group-plan-detail/group-plan-detail-page-content";
import { useGroupPlanDetail } from "@/features/group-plan-detail/hooks/use-group-plan-detail";
import { useGroupPlanDetailLandingFocus } from "@/features/group-plan-detail/hooks/use-group-plan-detail-landing-focus";
import { useGroupPlanDetailRealtime } from "@/features/group-plan-detail/hooks/use-group-plan-detail-realtime";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { GroupPlanDetailRouteSearch } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { PageErrorState } from "@/shared/components/page-error-state";

export function GroupPlanDetailPage() {
  const { groupId } = useParams({ from: "/app-shell/groups/$groupId" });
  const search = useSearch({ from: "/app-shell/groups/$groupId" });
  const detailQuery = useGroupPlanDetail(groupId);

  if (detailQuery.isLoading) {
    return <GroupPlanDetailPageLoading mode="query" />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <section
        aria-label="Group plan detail error"
        className="mx-auto w-full max-w-screen-2xl px-4 pt-3 pb-28 sm:px-5 md:pt-6 lg:px-8"
      >
        <PageErrorState
          title="Group details could not load"
          description="TeamForge could not refresh this group and plan briefing right now."
          retryLabel="Refresh details"
          onRetry={() => {
            void detailQuery.refetch();
          }}
        />
      </section>
    );
  }

  const detail = detailQuery.data;

  return <GroupPlanDetailLoadedPage detail={detail} search={search} />;
}

function GroupPlanDetailLoadedPage({
  detail,
  search,
}: {
  detail: GroupPlanDetail;
  search: GroupPlanDetailRouteSearch;
}) {
  useGroupPlanDetailRealtime({
    groupId: detail.group.id,
    planId: detail.plan?.id ?? null,
  });
  const landingFocus = useGroupPlanDetailLandingFocus({
    detail,
    planId: search.plan,
    proposalId: search.proposal,
  });

  return (
    <GroupPlanDetailPageContent
      detail={detail}
      highlightedProposalId={landingFocus.highlightedProposalId}
      isPlanHighlighted={landingFocus.isPlanHighlighted}
      isPlanningHighlighted={landingFocus.isPlanningHighlighted}
      planSectionRef={landingFocus.planSectionRef}
      planningSectionRef={landingFocus.planningSectionRef}
    />
  );
}
