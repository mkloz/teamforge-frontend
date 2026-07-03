import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  CircleDashed,
  Send,
  UsersRound,
} from "lucide-react";

import type {
  HomeRecommendedJoinMutation,
  JoinResultStatus,
  RecommendedGroupAccess,
  RecommendedGroupActionChoiceInput,
  RecommendedGroupActionProps,
  RecommendedGroupActionState,
} from "@/features/home/components/recommended-groups/recommended-group-card-parts/types";
import type { ExploreGroup } from "@/shared/schemas";

const JOIN_RESULT_ACTIONS: Record<
  JoinResultStatus,
  { icon: LucideIcon; label: string }
> = {
  JOINED: {
    icon: Check,
    label: "Joined",
  },
  REQUESTED: {
    icon: CircleDashed,
    label: "Requested",
  },
};

const READY_ACTION_LABELS: Record<RecommendedGroupAccess, string> = {
  BY_REQUEST: "Request",
  OPEN: "Join",
};

const PENDING_ACTION_LABELS: Record<RecommendedGroupAccess, string> = {
  BY_REQUEST: "Requesting...",
  OPEN: "Joining...",
};

const READY_ACTION_ICONS: Record<RecommendedGroupAccess, LucideIcon> = {
  BY_REQUEST: Send,
  OPEN: ArrowRight,
};

function getJoinResult(
  group: ExploreGroup,
  joinMutation: HomeRecommendedJoinMutation,
): JoinResultStatus | undefined {
  return (
    joinMutation.data?.data.status ??
    (joinMutation.isPending && group.access === "BY_REQUEST"
      ? "REQUESTED"
      : undefined)
  );
}

function getJoinResultAction(joinResult: JoinResultStatus | undefined) {
  return joinResult ? JOIN_RESULT_ACTIONS[joinResult] : null;
}

function getAccessActionLabel(
  access: RecommendedGroupAccess,
  isPending: boolean,
) {
  return isPending
    ? PENDING_ACTION_LABELS[access]
    : READY_ACTION_LABELS[access];
}

function getFullActionIcon(isFull: boolean) {
  return isFull ? UsersRound : null;
}

function getBlockedActionIcon({
  isOfflineActionBlocked,
  isPending,
}: Pick<
  RecommendedGroupActionChoiceInput,
  "isOfflineActionBlocked" | "isPending"
>) {
  return isPending || isOfflineActionBlocked ? CircleDashed : null;
}

function getJoinResultActionIcon(joinResult: JoinResultStatus | undefined) {
  return getJoinResultAction(joinResult)?.icon ?? null;
}

function getReadyActionIcon(access: RecommendedGroupAccess) {
  return READY_ACTION_ICONS[access] ?? ArrowRight;
}

function isActionIcon(icon: LucideIcon | null): icon is LucideIcon {
  return Boolean(icon);
}

function getFirstActionIcon(icons: Array<LucideIcon | null>) {
  return icons.find(isActionIcon) ?? ArrowRight;
}

function getActionLabel({
  group,
  isFull,
  isOfflineActionBlocked,
  isPending,
  joinResult,
}: RecommendedGroupActionChoiceInput) {
  if (isFull) {
    return "Full";
  }

  const joinResultAction = getJoinResultAction(joinResult);

  if (joinResultAction) {
    return joinResultAction.label;
  }

  if (isOfflineActionBlocked) {
    return "Reconnect";
  }

  return getAccessActionLabel(group.access, isPending);
}

function getActionIcon({
  group,
  isFull,
  isOfflineActionBlocked,
  isPending,
  joinResult,
}: RecommendedGroupActionChoiceInput): LucideIcon {
  return getFirstActionIcon([
    getFullActionIcon(isFull),
    getJoinResultActionIcon(joinResult),
    getBlockedActionIcon({ isOfflineActionBlocked, isPending }),
    getReadyActionIcon(group.access),
  ]);
}

export function getRecommendedGroupActionState({
  group,
  isFull,
  joinMutation,
}: RecommendedGroupActionProps): RecommendedGroupActionState {
  const joinResult = getJoinResult(group, joinMutation);
  const isOfflineActionBlocked =
    !joinMutation.isOnline && !isFull && joinResult === undefined;

  return {
    ActionIcon: getActionIcon({
      group,
      isFull,
      isOfflineActionBlocked,
      isPending: joinMutation.isPending,
      joinResult,
    }),
    joinResult,
    label: getActionLabel({
      group,
      isFull,
      isOfflineActionBlocked,
      isPending: joinMutation.isPending,
      joinResult,
    }),
  };
}

export function getJoinedGroupId(
  actionState: Pick<RecommendedGroupActionState, "joinResult">,
  joinMutation: HomeRecommendedJoinMutation,
) {
  return actionState.joinResult === "JOINED"
    ? joinMutation.data?.data.groupId
    : undefined;
}

export function isRecommendedActionDisabled({
  actionState,
  isFull,
  joinMutation,
}: {
  actionState: RecommendedGroupActionState;
  isFull: boolean;
  joinMutation: HomeRecommendedJoinMutation;
}) {
  return (
    isFull ||
    !joinMutation.isOnline ||
    joinMutation.isPending ||
    actionState.joinResult !== undefined
  );
}

export function getRecommendedActionTitle(isOnline: boolean) {
  return isOnline
    ? undefined
    : "Reconnect before joining or requesting to join.";
}
