import { Link } from "@tanstack/react-router";

import { Button } from "@/shared/components/ui/button";
import { GroupPlanCard } from "@/shared/components/group-plan-card";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";

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
  const joinResult = confirmedJoin?.status;
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
            ? "Request to join"
            : "Join";

  function handleJoin() {
    joinMutation.mutate();
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
          isFull && "opacity-50 pointer-events-none",
        )}
      >
        {actionLabel}
      </Button>
    );

  return <GroupPlanCard group={group} variant={variant} action={action} />;
}
