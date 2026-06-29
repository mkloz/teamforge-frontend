import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  CircleDashed,
  MessageCircle,
  Send,
  UsersRound,
} from "lucide-react";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/public/group-plan-detail-navigation";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { buildActivityGroupHubNavigation } from "@/shared/navigation/activity-navigation";
import type { ExploreGroup, ExploreJoinResult } from "@/shared/schemas";

type JoinResultStatus = ExploreJoinResult["status"];
type JoinMutationData = { data: ExploreJoinResult } | undefined;
type RecommendedGroupAccess = ExploreGroup["access"];

interface HomeRecommendedJoinMutation {
  data: JoinMutationData;
  isOnline: boolean;
  isPending: boolean;
  mutate: () => void;
}

interface RecommendedGroupActionState {
  ActionIcon: LucideIcon;
  joinResult: JoinResultStatus | undefined;
  label: string;
}

interface RecommendedGroupActionProps {
  group: ExploreGroup;
  isFull: boolean;
  joinMutation: HomeRecommendedJoinMutation;
}

interface RecommendedGroupDetailsLinkProps {
  group: ExploreGroup;
}

interface RecommendedGroupActionChoiceInput {
  group: ExploreGroup;
  isFull: boolean;
  isOfflineActionBlocked: boolean;
  isPending: boolean;
  joinResult: JoinResultStatus | undefined;
}

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

function getRecommendedGroupActionState({
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

function getJoinedGroupId(
  actionState: Pick<RecommendedGroupActionState, "joinResult">,
  joinMutation: HomeRecommendedJoinMutation,
) {
  return actionState.joinResult === "JOINED"
    ? joinMutation.data?.data.groupId
    : undefined;
}

function isRecommendedActionDisabled({
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

function getRecommendedActionTitle(isOnline: boolean) {
  return isOnline
    ? undefined
    : "Reconnect before joining or requesting to join.";
}

export function RecommendedGroupAction({
  group,
  isFull,
  joinMutation,
}: RecommendedGroupActionProps) {
  const actionState = getRecommendedGroupActionState({
    group,
    isFull,
    joinMutation,
  });
  const joinedGroupId = getJoinedGroupId(actionState, joinMutation);

  if (joinedGroupId) {
    return (
      <Button asChild variant="primary" size="sm" className="shrink-0">
        <Link {...buildActivityGroupHubNavigation(joinedGroupId)}>
          <MessageCircle className="size-3.5" aria-hidden="true" />
          Open group
        </Link>
      </Button>
    );
  }

  const { ActionIcon } = actionState;

  return (
    <Button
      variant={isFull ? "outline" : "primary"}
      size="sm"
      disabled={isRecommendedActionDisabled({
        actionState,
        isFull,
        joinMutation,
      })}
      onClick={() => joinMutation.mutate()}
      title={getRecommendedActionTitle(joinMutation.isOnline)}
      className={cn("shrink-0", isFull && "opacity-60")}
      contentClassName="whitespace-nowrap"
    >
      <ActionIcon className="size-3.5" aria-hidden="true" />
      {actionState.label}
    </Button>
  );
}

export function RecommendedGroupDetailsLink({
  group,
}: RecommendedGroupDetailsLinkProps) {
  return (
    <Link
      {...buildGroupPlanDetailNavigation(group.id, { source: "home" })}
      aria-label={`View ${group.name} group details`}
      className="block size-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="sr-only">View group details</span>
    </Link>
  );
}
