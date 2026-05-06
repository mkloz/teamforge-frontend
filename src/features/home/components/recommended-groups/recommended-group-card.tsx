import { Link } from "@tanstack/react-router";

import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { useJoinHomeRecommendedGroup } from "@/features/home/hooks/use-join-home-recommended-group";
import { GroupPlanCard } from "@/shared/components/group-plan-card";
import { Button } from "@/shared/components/ui/button";
import { isExploreGroupFull } from "@/shared/lib/explore-group-presenters";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";

interface RecommendedGroupCardProps {
  group: ExploreGroup;
}

export function RecommendedGroupCard({ group }: RecommendedGroupCardProps) {
  const joinMutation = useJoinHomeRecommendedGroup(group.id);
  const isFull = isExploreGroupFull(group);
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
      <Button asChild variant="primary" size="sm" className="shrink-0">
        <Link
          {...buildActivityGroupHubNavigation(joinMutation.data.data.groupId)}
        >
          Open group
        </Link>
      </Button>
    ) : (
      <Button
        variant={isFull ? "outline" : "primary"}
        size="sm"
        disabled={isFull || joinMutation.isPending || joinResult !== undefined}
        onClick={() => joinMutation.mutate()}
        className={cn("shrink-0", isFull && "opacity-60")}
      >
        {actionLabel}
      </Button>
    );

  return <GroupPlanCard group={group} variant="compact" action={action} />;
}
