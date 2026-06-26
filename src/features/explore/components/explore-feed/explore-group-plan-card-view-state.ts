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

type JoinResultStatus = NonNullable<
  ExploreGroupPlanCardViewState["joinResult"]
>;

interface JoinActionPresentation {
  icon: ExploreGroupPlanCardActionIcon;
  label: string;
}

const FULL_JOIN_ACTION = {
  icon: "users",
  label: "Full",
} as const satisfies JoinActionPresentation;

const OFFLINE_JOIN_ACTION = {
  icon: "pending",
  label: "Reconnect",
} as const satisfies JoinActionPresentation;

const JOIN_RESULT_ACTIONS = {
  JOINED: {
    icon: "check",
    label: "Joined",
  },
  REQUESTED: {
    icon: "pending",
    label: "Requested",
  },
} as const satisfies Record<JoinResultStatus, JoinActionPresentation>;

const PENDING_JOIN_ACTIONS = {
  BY_REQUEST: {
    icon: "pending",
    label: "Requesting...",
  },
  OPEN: {
    icon: "pending",
    label: "Joining...",
  },
} as const satisfies Record<ExploreGroup["access"], JoinActionPresentation>;

const READY_JOIN_ACTIONS = {
  BY_REQUEST: {
    icon: "request",
    label: "Request to join",
  },
  OPEN: {
    icon: "arrow",
    label: "Join",
  },
} as const satisfies Record<ExploreGroup["access"], JoinActionPresentation>;

export function getExploreGroupPlanCardViewState({
  confirmedJoin,
  group,
  isJoinPending,
  isOnline,
}: GetExploreGroupPlanCardViewStateParams): ExploreGroupPlanCardViewState {
  const actionState = getJoinActionState({
    confirmedJoin,
    group,
    isJoinPending,
    isOnline,
  });
  const actionPresentation = getJoinActionPresentation(actionState);

  return {
    actionIcon: actionPresentation.icon,
    actionLabel: actionPresentation.label,
    isFull: actionState.isFull,
    isJoinActionDisabled: actionState.isDisabled,
    joinActionTitle: actionState.title,
    joinedGroupId: actionState.joinedGroupId,
    joinResult: actionState.joinResult,
  };
}

interface JoinActionStateInput {
  access: ExploreGroup["access"];
  isFull: boolean;
  isJoinPending: boolean;
  isOfflineActionBlocked: boolean;
  joinResult: ExploreGroupPlanCardViewState["joinResult"];
}

interface JoinActionState extends JoinActionStateInput {
  isDisabled: boolean;
  joinedGroupId: string | undefined;
  title: string | undefined;
}

function getJoinActionState({
  confirmedJoin,
  group,
  isJoinPending,
  isOnline,
}: GetExploreGroupPlanCardViewStateParams): JoinActionState {
  const isFull = isExploreGroupAtCapacity(group);
  const joinResult = getJoinResult({ confirmedJoin, group, isJoinPending });
  const isOfflineActionBlocked = isOfflineJoinActionBlocked({
    isFull,
    isOnline,
    joinResult,
  });

  return {
    access: group.access,
    isDisabled: isJoinActionDisabled({
      isFull,
      isJoinPending,
      isOnline,
      joinResult,
    }),
    isFull,
    isJoinPending,
    isOfflineActionBlocked,
    joinedGroupId: confirmedJoin?.groupId,
    joinResult,
    title: isOnline
      ? undefined
      : "Reconnect before joining or requesting to join.",
  };
}

function isExploreGroupAtCapacity(group: ExploreGroup) {
  return group.maxMembers > 0 && group.activeMembersCount >= group.maxMembers;
}

function isOfflineJoinActionBlocked({
  isFull,
  isOnline,
  joinResult,
}: Pick<JoinActionState, "isFull" | "joinResult"> & { isOnline: boolean }) {
  return !isOnline && !isFull && joinResult === undefined;
}

function isJoinActionDisabled({
  isFull,
  isJoinPending,
  isOnline,
  joinResult,
}: Pick<JoinActionState, "isFull" | "isJoinPending" | "joinResult"> & {
  isOnline: boolean;
}) {
  return isFull || !isOnline || isJoinPending || joinResult !== undefined;
}

function getJoinResult({
  confirmedJoin,
  group,
  isJoinPending,
}: Pick<
  GetExploreGroupPlanCardViewStateParams,
  "confirmedJoin" | "group" | "isJoinPending"
>): ExploreGroupPlanCardViewState["joinResult"] {
  return (
    confirmedJoin?.status ?? getPendingJoinResult({ group, isJoinPending })
  );
}

function getPendingJoinResult({
  group,
  isJoinPending,
}: Pick<GetExploreGroupPlanCardViewStateParams, "group" | "isJoinPending">) {
  return isJoinPending && group.access === "BY_REQUEST"
    ? "REQUESTED"
    : undefined;
}

function getJoinActionPresentation(
  state: JoinActionStateInput,
): JoinActionPresentation {
  const action = [
    getFullJoinAction(state),
    getJoinResultAction(state),
    getOfflineJoinAction(state),
    getPendingJoinAction(state),
  ].find(isJoinActionPresentation);

  return action ?? READY_JOIN_ACTIONS[state.access];
}

function isJoinActionPresentation(
  action: JoinActionPresentation | undefined,
): action is JoinActionPresentation {
  return action !== undefined;
}

function getFullJoinAction({ isFull }: Pick<JoinActionStateInput, "isFull">) {
  return isFull ? FULL_JOIN_ACTION : undefined;
}

function getJoinResultAction({
  joinResult,
}: Pick<JoinActionStateInput, "joinResult">) {
  return joinResult === undefined ? undefined : JOIN_RESULT_ACTIONS[joinResult];
}

function getOfflineJoinAction({
  isOfflineActionBlocked,
}: Pick<JoinActionStateInput, "isOfflineActionBlocked">) {
  return isOfflineActionBlocked ? OFFLINE_JOIN_ACTION : undefined;
}

function getPendingJoinAction({
  access,
  isJoinPending,
}: Pick<JoinActionStateInput, "access" | "isJoinPending">) {
  return isJoinPending ? PENDING_JOIN_ACTIONS[access] : undefined;
}
