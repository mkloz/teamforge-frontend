import { useParams, useSearch } from "@tanstack/react-router";
import { GroupPlanDetailPageLoading } from "@/features/group-plan-detail/group-plan-detail-page.loading";
import { GroupPlanDetailPageContent } from "@/features/group-plan-detail/group-plan-detail-page-content";
import { useGroupPlanDetail } from "@/features/group-plan-detail/hooks/use-group-plan-detail";
import { useGroupPlanDetailLandingFocus } from "@/features/group-plan-detail/hooks/use-group-plan-detail-landing-focus";
import { useGroupPlanDetailRealtime } from "@/features/group-plan-detail/hooks/use-group-plan-detail-realtime";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { GroupPlanDetailRouteSearch } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { PageErrorState } from "@/shared/components/page-error-state";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const GROUP_PLAN_DETAIL_ROUTE = "/app-shell/groups/$groupId";
const GROUP_PLAN_DETAIL_DEFAULT_DESCRIPTION =
  "Review the TeamForge group, plan, members, and fit signals.";

export function GroupPlanDetailPage() {
  const { groupId } = useParams({ from: GROUP_PLAN_DETAIL_ROUTE });
  const search = useSearch({ from: GROUP_PLAN_DETAIL_ROUTE });
  const detailQuery = useGroupPlanDetail(groupId);
  const pageMetadata = getGroupPlanDetailPageMetadata(detailQuery.data);

  usePageMetadata(pageMetadata);

  return (
    <GroupPlanDetailQueryState detailQuery={detailQuery} search={search} />
  );
}

function GroupPlanDetailQueryState({
  detailQuery,
  search,
}: {
  detailQuery: ReturnType<typeof useGroupPlanDetail>;
  search: GroupPlanDetailRouteSearch;
}) {
  if (detailQuery.isLoading) {
    return <GroupPlanDetailPageLoading mode="query" />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return <GroupPlanDetailErrorState onRetry={detailQuery.refetch} />;
  }

  return (
    <GroupPlanDetailLoadedView detail={detailQuery.data} search={search} />
  );
}

function GroupPlanDetailErrorState({
  onRetry,
}: {
  onRetry: ReturnType<typeof useGroupPlanDetail>["refetch"];
}) {
  return (
    <section
      aria-label="Group plan detail error"
      className="mx-auto w-full max-w-screen-2xl px-4 pt-3 pb-6 sm:px-5 md:pt-6 lg:px-8"
    >
      <PageErrorState
        title="Group details could not load"
        description="TeamForge could not refresh this group and plan briefing right now."
        retryLabel="Refresh details"
        onRetry={() => {
          void onRetry();
        }}
      />
    </section>
  );
}

function GroupPlanDetailLoadedView({
  detail,
  search,
}: {
  detail: GroupPlanDetail;
  search: GroupPlanDetailRouteSearch;
}) {
  const landingFocus = useGroupPlanDetailLoadedView({ detail, search });

  return (
    <GroupPlanDetailPageContent
      detail={detail}
      isPlanHighlighted={landingFocus.isPlanHighlighted}
      planSectionRef={landingFocus.planSectionRef}
      search={search}
    />
  );
}

function useGroupPlanDetailLoadedView({
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

  return useGroupPlanDetailLandingFocus({
    detail,
    planId: search.plan,
    proposalId: search.proposal,
  });
}

function getGroupPlanDetailPageMetadata(detail: GroupPlanDetail | undefined) {
  return createTeamForgePageMetadata({
    title: getGroupPlanDetailPageTitle(detail),
    description: getGroupPlanDetailPageDescription(detail),
  });
}

function getGroupPlanDetailPageTitle(detail: GroupPlanDetail | undefined) {
  return detail?.plan?.title
    ? `${detail.plan.title} · ${detail.group.name}`
    : (detail?.group.name ?? "Group details");
}

function getGroupPlanDetailPageDescription(
  detail: GroupPlanDetail | undefined,
) {
  return detail?.plan?.description
    ? detail.plan.description
    : GROUP_PLAN_DETAIL_DEFAULT_DESCRIPTION;
}
