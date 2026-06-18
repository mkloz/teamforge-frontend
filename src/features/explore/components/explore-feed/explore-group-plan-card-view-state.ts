import type { ExploreGroup, ExploreJoinResult } from "@/shared/schemas";

export type ExploreGroupPlanCardActionIcon =
  | "arrow"
  | "check"
  | "pending"
  | "request"
  | "users";

export interface ExploreGroupPlanCardViewState {
  actionIcon: ExploreGroupPlanCardActionIcon;
  actionLabel: string;
  isFull: boolean;
  isJoinActionDisabled: boolean;
  joinActionTitle: string | undefined;
  joinedGroupId: string | undefined;
  joinResult: ExploreJoinResult["status"] | undefined;
}

interface GetExploreGroupPlanCardViewStateParams {
  confirmedJoin: ExploreJoinResult | undefined;
  group: ExploreGroup;
  isJoinPending: boolean;
  isOnline: boolean;
}

export function getExploreGroupPlanCardViewState({
  confirmedJoin,
  group,
  isJoinPending,
  isOnline,
}: GetExploreGroupPlanCardViewStateParams): ExploreGroupPlanCardViewState {
  const isFull =
    group.maxMembers > 0 && group.activeMembersCount >= group.maxMembers;
  const joinResult =
    confirmedJoin?.status ??
    (isJoinPending && group.access === "BY_REQUEST" ? "REQUESTED" : undefined);
  const isOfflineActionBlocked =
    !isOnline && !isFull && joinResult === undefined;

  return {
    actionIcon: getJoinActionIcon({
      access: group.access,
      isFull,
      isJoinPending,
      isOfflineActionBlocked,
      joinResult,
    }),
    actionLabel: getJoinActionLabel({
      access: group.access,
      isFull,
      isJoinPending,
      isOfflineActionBlocked,
      joinResult,
    }),
    isFull,
    isJoinActionDisabled:
      isFull || !isOnline || isJoinPending || joinResult !== undefined,
    joinActionTitle: isOnline
      ? undefined
      : "Reconnect before joining or requesting to join.",
    joinedGroupId: confirmedJoin?.groupId,
    joinResult,
  };
}

interface JoinActionStateInput {
  access: ExploreGroup["access"];
  isFull: boolean;
  isJoinPending: boolean;
  isOfflineActionBlocked: boolean;
  joinResult: ExploreGroupPlanCardViewState["joinResult"];
}

function getJoinActionLabel({
  access,
  isFull,
  isJoinPending,
  isOfflineActionBlocked,
  joinResult,
}: JoinActionStateInput) {
  if (isFull) {
    return "Full";
  }

  if (joinResult === "JOINED") {
    return "Joined";
  }

  if (joinResult === "REQUESTED") {
    return "Requested";
  }

  if (isOfflineActionBlocked) {
    return "Reconnect";
  }

  if (isJoinPending) {
    return access === "BY_REQUEST" ? "Requesting..." : "Joining...";
  }

  return access === "BY_REQUEST" ? "Request to join" : "Join";
}

function getJoinActionIcon({
  access,
  isFull,
  isJoinPending,
  isOfflineActionBlocked,
  joinResult,
}: JoinActionStateInput): ExploreGroupPlanCardActionIcon {
  if (isFull) {
    return "users";
  }

  if (joinResult === "JOINED") {
    return "check";
  }

  if (joinResult === "REQUESTED" || isJoinPending || isOfflineActionBlocked) {
    return "pending";
  }

  return access === "BY_REQUEST" ? "request" : "arrow";
}
