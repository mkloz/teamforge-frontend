import {
  type GroupPlanViewerRelationship,
  isGroupPlanInvitedRelationship,
  isGroupPlanMemberRelationship,
  isGroupPlanRequestedRelationship,
} from "@/features/group-plan-detail/lib/group-plan-access";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

type ViewerJoinState = Pick<
  GroupPlanDetail["viewer"],
  "canCancelRequest" | "canJoin" | "canRequestToJoin" | "joinDisabledReason"
>;

export function getOptimisticJoinRelationship(
  detail: GroupPlanDetail | undefined,
): GroupPlanViewerRelationship {
  return detail?.viewer.canRequestToJoin ? "REQUESTED" : "MEMBER";
}

export function updateOptimisticViewerRelationship(
  detail: GroupPlanDetail,
  relationship: GroupPlanViewerRelationship,
): GroupPlanDetail {
  const isMember = isGroupPlanMemberRelationship(relationship);
  const isInvited = isGroupPlanInvitedRelationship(relationship);

  return {
    ...detail,
    group: {
      ...detail.group,
      activeMembersCount: getOptimisticActiveMemberCount({
        detail,
        isMember,
        relationship,
      }),
    },
    viewer: {
      ...detail.viewer,
      ...getNextViewerJoinState(detail, relationship),
      relationship,
      canLeaveGroup: isMember,
      canOpenActivity: isMember,
      pendingInviteId: isInvited ? detail.viewer.pendingInviteId : null,
      role: isMember ? (detail.viewer.role ?? "MEMBER") : null,
    },
  };
}

function getJoinableViewerState(detail: GroupPlanDetail): ViewerJoinState {
  const canJoin = detail.group.access === "OPEN";
  const canRequestToJoin = detail.group.access === "BY_REQUEST";

  return {
    canCancelRequest: false,
    canJoin,
    canRequestToJoin,
    joinDisabledReason: canJoin || canRequestToJoin ? null : "PRIVATE",
  };
}

function getLockedViewerState(
  relationship: GroupPlanViewerRelationship,
): ViewerJoinState {
  const isRequested = isGroupPlanRequestedRelationship(relationship);

  return {
    canCancelRequest: isRequested,
    canJoin: false,
    canRequestToJoin: false,
    joinDisabledReason: isRequested ? "REQUEST_PENDING" : null,
  };
}

function getNextViewerJoinState(
  detail: GroupPlanDetail,
  relationship: GroupPlanViewerRelationship,
): ViewerJoinState {
  if (shouldRefreshJoinableState(relationship)) {
    return getJoinableViewerState(detail);
  }

  return getLockedViewerState(relationship);
}

function shouldRefreshJoinableState(relationship: GroupPlanViewerRelationship) {
  return relationship === "NOT_MEMBER" || relationship === "FORMER_MEMBER";
}

function getOptimisticActiveMemberCount({
  detail,
  isMember,
  relationship,
}: {
  detail: GroupPlanDetail;
  isMember: boolean;
  relationship: GroupPlanViewerRelationship;
}) {
  const { activeMembersCount, maxMembers } = detail.group;

  if (isMember) {
    return maxMembers > 0
      ? Math.min(maxMembers, activeMembersCount + 1)
      : activeMembersCount + 1;
  }

  if (relationship === "FORMER_MEMBER") {
    return Math.max(0, activeMembersCount - 1);
  }

  return activeMembersCount;
}
