import { getGroupPlanViewerAccess } from "@/features/group-plan-detail/lib/group-plan-access";
import {
  ACTION_STATE_BUILDERS,
  buildJoinedMemberState,
} from "@/features/group-plan-detail/lib/group-plan-action-state/action-state-builders";
import { getSummary } from "@/features/group-plan-detail/lib/group-plan-action-state/summary-copy";
import type {
  ActionStateBuilderContext,
  GroupPlanActionControls,
  GroupPlanActionViewState,
} from "@/features/group-plan-detail/lib/group-plan-action-state/types";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { ExploreJoinResult } from "@/shared/schemas/explore";

export type {
  GroupPlanActionControls,
  GroupPlanActionDescriptor,
  GroupPlanActionViewState,
} from "@/features/group-plan-detail/lib/group-plan-action-state/types";

export function buildGroupPlanActionViewState({
  controls,
  detail,
  joinResult,
}: {
  controls: GroupPlanActionControls;
  detail: GroupPlanDetail;
  joinResult: ExploreJoinResult | null | undefined;
}): GroupPlanActionViewState {
  const access = getGroupPlanViewerAccess(detail, joinResult);
  const summary = getSummary({
    detail,
    isMember: access.isMember,
    mode: access.mode,
  });
  const context: ActionStateBuilderContext = {
    access,
    controls,
    detail,
    summary,
  };

  if (!access.isMember && access.joinedGroupId) {
    return buildJoinedMemberState(access.joinedGroupId);
  }

  return ACTION_STATE_BUILDERS[access.mode](context);
}
