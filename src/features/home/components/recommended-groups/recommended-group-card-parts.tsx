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

import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup, ExploreJoinResult } from "@/shared/schemas";

type JoinResultStatus = ExploreJoinResult["status"];
type JoinMutationData = { data: ExploreJoinResult } | undefined;

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

function getActionLabel({
  group,
  isFull,
  isOfflineActionBlocked,
  isPending,
  joinResult,
}: {
  group: ExploreGroup;
  isFull: boolean;
  isOfflineActionBlocked: boolean;
  isPending: boolean;
  joinResult: JoinResultStatus | undefined;
}) {
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

  if (isPending) {
    return group.access === "BY_REQUEST" ? "Requesting..." : "Joining...";
  }

  return group.access === "BY_REQUEST" ? "Request" : "Join";
}

function getActionIcon({
  group,
  isFull,
  isOfflineActionBlocked,
  isPending,
  joinResult,
}: {
  group: ExploreGroup;
  isFull: boolean;
  isOfflineActionBlocked: boolean;
  isPending: boolean;
  joinResult: JoinResultStatus | undefined;
}): LucideIcon {
  if (isFull) {
    return UsersRound;
  }

  if (joinResult === "JOINED") {
    return Check;
  }

  if (joinResult === "REQUESTED" || isPending || isOfflineActionBlocked) {
    return CircleDashed;
  }

  return group.access === "BY_REQUEST" ? Send : ArrowRight;
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
  const joinedGroupId =
    actionState.joinResult === "JOINED"
      ? joinMutation.data?.data.groupId
      : undefined;

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
      disabled={
        isFull ||
        !joinMutation.isOnline ||
        joinMutation.isPending ||
        actionState.joinResult !== undefined
      }
      onClick={() => joinMutation.mutate()}
      title={
        joinMutation.isOnline
          ? undefined
          : "Reconnect before joining or requesting to join."
      }
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
