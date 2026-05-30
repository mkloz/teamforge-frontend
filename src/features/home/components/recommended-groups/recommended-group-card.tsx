import { Link } from "@tanstack/react-router";
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
  const joinResult =
    joinMutation.data?.data.status ??
    (joinMutation.isPending && group.access === "BY_REQUEST"
      ? "REQUESTED"
      : undefined);
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
  const ActionIcon = isFull
    ? UsersRound
    : joinResult === "JOINED"
      ? Check
      : joinResult === "REQUESTED" || joinMutation.isPending
        ? CircleDashed
        : group.access === "BY_REQUEST"
          ? Send
          : ArrowRight;

  const action =
    joinResult === "JOINED" && joinMutation.data?.data.groupId ? (
      <Button asChild variant="primary" size="sm" className="shrink-0">
        <Link
          {...buildActivityGroupHubNavigation(joinMutation.data.data.groupId)}
        >
          <MessageCircle className="size-3.5" aria-hidden="true" />
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
        contentClassName="whitespace-nowrap"
      >
        <ActionIcon className="size-3.5" aria-hidden="true" />
        {actionLabel}
      </Button>
    );

  const detailsLink = (
    <Link
      {...buildGroupPlanDetailNavigation(group.id, { source: "home" })}
      aria-label={`View ${group.name} group details`}
      className="block size-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="sr-only">View group details</span>
    </Link>
  );

  return (
    <GroupPlanCard
      group={group}
      variant="compact"
      action={action}
      detailsLink={detailsLink}
    />
  );
}
