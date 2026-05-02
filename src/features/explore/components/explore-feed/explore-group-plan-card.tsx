import { Link } from "@tanstack/react-router";
import { startTransition, useOptimistic } from "react";

import { Button } from "@/shared/components/ui/button";
import { GroupPlanCard } from "@/shared/components/group-plan-card";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup, ExploreJoinResult } from "@/shared/schemas";

import { useJoinExploreGroup } from "@/features/explore/hooks/use-join-explore-group";

interface ExploreGroupPlanCardProps {
  group: ExploreGroup;
  variant?: "default" | "compact";
}

export function ExploreGroupPlanCard({
  group,
  variant = "default",
}: ExploreGroupPlanCardProps) {
  const joinMutation = useJoinExploreGroup(group.id);
  const isCompact = variant === "compact";
  const isFull =
    group.maxMembers > 0 && group.activeMembersCount >= group.maxMembers;
  const confirmedJoin = joinMutation.data?.data;
  const [optimisticJoin, setOptimisticJoin] = useOptimistic<
    ExploreJoinResult | undefined,
    ExploreJoinResult
  >(confirmedJoin, (_current, nextJoin) => nextJoin);
  const joinResult = optimisticJoin?.status;
  const joinedGroupId = confirmedJoin?.groupId;
  const actionLabel = isFull
    ? "Full"
    : joinResult === "JOINED"
      ? "Joined"
      : joinResult === "REQUESTED"
        ? "Requested"
        : joinMutation.isPending
          ? group.access === "BY_REQUEST"
            ? "Requesting..."
            : "Joining..."
          : group.access === "BY_REQUEST"
            ? "Request"
            : "Join";

  function handleJoin() {
    startTransition(async () => {
      setOptimisticJoin({
        status: group.access === "BY_REQUEST" ? "REQUESTED" : "JOINED",
        groupId: group.id,
        chatId: null,
        message:
          group.access === "BY_REQUEST"
            ? "Join request sent."
            : "You joined the group.",
      });

      try {
        await joinMutation.mutateAsync();
      } catch {
        // TanStack Query owns user-facing error handling and cache recovery.
      }
    });
  }

  const action =
    joinResult === "JOINED" && joinedGroupId ? (
      <Button asChild variant="primary" size={isCompact ? "sm" : "default"}>
        <Link {...buildActivityGroupHubNavigation(joinedGroupId)}>
          Open group
        </Link>
      </Button>
    ) : (
      <Button
        variant={isFull ? "outline" : "primary"}
        size={isCompact ? "sm" : "default"}
        disabled={isFull || joinMutation.isPending || joinResult !== undefined}
        onClick={handleJoin}
        className={cn(
          "shrink-0 z-20 shadow-sm",
          isFull && "opacity-50 pointer-events-none hidden md:inline-flex",
        )}
      >
        {actionLabel}
      </Button>
    );

  return <GroupPlanCard group={group} variant={variant} action={action} />;
}
