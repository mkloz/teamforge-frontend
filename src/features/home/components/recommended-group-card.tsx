import { Link } from "@tanstack/react-router";

import { GroupPlanCard } from "@/shared/components/group-plan-card";
import { Button } from "@/shared/components/ui/button";
import { buildActivityGroupHubNavigation } from "@/shared/lib/activity-route";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";

import { useJoinHomeRecommendedGroup } from "@/features/home/hooks/use-join-home-recommended-group";

interface RecommendedGroupCardProps {
  group: ExploreGroup;
  variant?: "default" | "compact";
}

export function RecommendedGroupCard({
  group,
  variant = "compact",
}: RecommendedGroupCardProps) {
  const joinMutation = useJoinHomeRecommendedGroup(group.id);
  const isCompact = variant === "compact";
  const isFull =
    group.maxMembers > 0 && group.activeMembersCount >= group.maxMembers;
  const joinResult = joinMutation.data?.data.status;
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

  const action =
    joinResult === "JOINED" && joinMutation.data?.data.groupId ? (
      <Button asChild variant="primary" size={isCompact ? "sm" : "default"}>
        <Link
          {...buildActivityGroupHubNavigation(joinMutation.data.data.groupId)}
        >
          Open group
        </Link>
      </Button>
    ) : (
      <Button
        variant={isFull ? "outline" : "primary"}
        size={isCompact ? "sm" : "default"}
        disabled={isFull || joinMutation.isPending || joinResult !== undefined}
        onClick={() => joinMutation.mutate()}
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
