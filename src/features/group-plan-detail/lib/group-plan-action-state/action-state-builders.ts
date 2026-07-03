import type { GroupPlanViewerAccess } from "@/features/group-plan-detail/lib/group-plan-access";
import {
  buildAcceptInviteAction,
  buildBlockedAction,
  buildCancelRequestAction,
  buildDeclineInviteAction,
  buildExploreAction,
  buildGroupChatAction,
  buildJoinGroupAction,
  buildLeaveGroupAction,
  buildRequestedDisabledAction,
} from "@/features/group-plan-detail/lib/group-plan-action-state/action-descriptor-builders";
import type {
  ActionStateBuilder,
  ActionStateBuilderContext,
  GroupPlanActionDescriptor,
  GroupPlanActionViewState,
  GroupPlanViewerMode,
} from "@/features/group-plan-detail/lib/group-plan-action-state/types";

function buildActionViewState({
  access,
  primary,
  secondary,
  summary,
}: {
  access: GroupPlanViewerAccess;
  primary: GroupPlanActionDescriptor;
  secondary: GroupPlanActionDescriptor | null;
  summary: string;
}): GroupPlanActionViewState {
  return {
    mode: access.mode,
    isMember: access.isMember,
    primary,
    secondary,
    summary,
    joinedGroupId: access.joinedGroupId,
  };
}

function buildCurrentMemberState({
  access,
  controls,
  detail,
  summary,
}: ActionStateBuilderContext): GroupPlanActionViewState {
  return buildActionViewState({
    access,
    primary: buildGroupChatAction(detail.group.id),
    secondary: detail.viewer.canLeaveGroup
      ? buildLeaveGroupAction(controls)
      : null,
    summary,
  });
}

export function buildJoinedMemberState(
  joinedGroupId: string,
): GroupPlanActionViewState {
  return {
    mode: "member",
    isMember: true,
    primary: buildGroupChatAction(joinedGroupId),
    secondary: null,
    summary: "You're in. Continue in the group workspace.",
    joinedGroupId,
  };
}

function buildInvitedState({
  access,
  controls,
  detail,
  summary,
}: ActionStateBuilderContext): GroupPlanActionViewState {
  const pendingInviteId = detail.viewer.pendingInviteId;

  return buildActionViewState({
    access,
    primary: buildAcceptInviteAction({ controls, pendingInviteId }),
    secondary: buildDeclineInviteAction({ controls, pendingInviteId }),
    summary,
  });
}

function buildRequestedState({
  access,
  controls,
  summary,
}: ActionStateBuilderContext): GroupPlanActionViewState {
  return buildActionViewState({
    access,
    primary: buildRequestedDisabledAction(),
    secondary: buildCancelRequestAction(controls),
    summary,
  });
}

function buildJoinableState({
  access,
  controls,
  detail,
  summary,
}: ActionStateBuilderContext): GroupPlanActionViewState {
  return buildActionViewState({
    access,
    primary: buildJoinGroupAction({
      controls,
      mode: detail.viewer.canRequestToJoin ? "request" : "direct",
    }),
    secondary: buildExploreAction(),
    summary,
  });
}

function buildBlockedState({
  access,
  detail,
  summary,
}: ActionStateBuilderContext): GroupPlanActionViewState {
  return buildActionViewState({
    access,
    primary: buildBlockedAction(detail),
    secondary: buildExploreAction(),
    summary,
  });
}

export const ACTION_STATE_BUILDERS = {
  blocked: buildBlockedState,
  invited: buildInvitedState,
  joinable: buildJoinableState,
  member: buildCurrentMemberState,
  requested: buildRequestedState,
} satisfies Record<GroupPlanViewerMode, ActionStateBuilder>;
