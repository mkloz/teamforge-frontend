import { Link } from "@tanstack/react-router";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { useJoinExploreGroup } from "@/features/explore/hooks/use-join-explore-group";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { GroupPlanCard } from "@/shared/components/group-plan-card";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";

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
          "z-20 shrink-0 shadow-sm",
          isFull && "pointer-events-none opacity-50",
        )}
      >
        {actionLabel}
      </Button>
    );

  const detailsLink = (
    <Link
      {...buildGroupPlanDetailNavigation(group.id, { source: "explore" })}
      aria-label={`View ${group.name} group details`}
      className="block size-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="sr-only">View group details</span>
    </Link>
  );

  return (
    <GroupPlanCard
      group={group}
      variant={variant}
      action={action}
      detailsLink={detailsLink}
    />
  );
}
