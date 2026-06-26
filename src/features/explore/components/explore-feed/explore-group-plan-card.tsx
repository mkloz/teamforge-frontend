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
import { useJoinExploreGroup } from "@/features/explore/hooks/use-join-explore-group";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { GroupPlanCard } from "@/shared/components/group-plan-card";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";
import {
  type ExploreGroupPlanCardActionIcon,
  type ExploreGroupPlanCardViewState,
  getExploreGroupPlanCardViewState,
} from "./explore-group-plan-card-view-state";

interface ExploreGroupPlanCardProps {
  group: ExploreGroup;
  imagePriority?: "auto" | "high";
  variant?: "default" | "compact";
}

const actionIconByState = {
  arrow: ArrowRight,
  check: Check,
  pending: CircleDashed,
  request: Send,
  users: UsersRound,
} satisfies Record<ExploreGroupPlanCardActionIcon, typeof ArrowRight>;

export function ExploreGroupPlanCard({
  group,
  imagePriority = "auto",
  variant = "default",
}: ExploreGroupPlanCardProps) {
  const joinMutation = useJoinExploreGroup(group.id);
  const isCompact = variant === "compact";
  const viewState = getExploreGroupPlanCardViewState({
    confirmedJoin: joinMutation.data?.data,
    group,
    isJoinPending: joinMutation.isPending,
    isOnline: joinMutation.isOnline,
  });

  function handleJoin() {
    joinMutation.mutate();
  }

  return (
    <GroupPlanCard
      group={group}
      variant={variant}
      action={
        <ExploreGroupPlanCardAction
          isCompact={isCompact}
          onJoin={handleJoin}
          viewState={viewState}
        />
      }
      detailsLink={<ExploreGroupDetailsLink group={group} />}
      imagePriority={imagePriority}
    />
  );
}

interface ExploreGroupPlanCardActionProps {
  isCompact: boolean;
  onJoin: () => void;
  viewState: ExploreGroupPlanCardViewState;
}

function ExploreGroupPlanCardAction({
  isCompact,
  onJoin,
  viewState,
}: ExploreGroupPlanCardActionProps) {
  if (shouldRenderJoinedGroupAction(viewState)) {
    return (
      <JoinedGroupActionButton
        isCompact={isCompact}
        joinedGroupId={viewState.joinedGroupId}
      />
    );
  }

  return (
    <JoinGroupActionButton
      isCompact={isCompact}
      onJoin={onJoin}
      viewState={viewState}
    />
  );
}

function JoinedGroupActionButton({
  isCompact,
  joinedGroupId,
}: {
  isCompact: boolean;
  joinedGroupId: string;
}) {
  return (
    <Button asChild variant="primary" size={isCompact ? "sm" : "default"}>
      <Link {...buildActivityGroupHubNavigation(joinedGroupId)}>
        <MessageCircle className="size-4" aria-hidden="true" />
        Open group
      </Link>
    </Button>
  );
}

function JoinGroupActionButton({
  isCompact,
  onJoin,
  viewState,
}: ExploreGroupPlanCardActionProps) {
  const ActionIcon = actionIconByState[viewState.actionIcon];

  return (
    <Button
      variant={viewState.isFull ? "outline" : "primary"}
      size={isCompact ? "sm" : "default"}
      disabled={viewState.isJoinActionDisabled}
      onClick={onJoin}
      title={viewState.joinActionTitle}
      className={cn(
        "z-20 shrink-0 shadow-sm",
        viewState.isFull && "pointer-events-none opacity-50",
      )}
    >
      <ActionIcon className="size-4" aria-hidden="true" />
      {viewState.actionLabel}
    </Button>
  );
}

function shouldRenderJoinedGroupAction(
  viewState: ExploreGroupPlanCardViewState,
): viewState is ExploreGroupPlanCardViewState & { joinedGroupId: string } {
  return viewState.joinResult === "JOINED" && Boolean(viewState.joinedGroupId);
}

function ExploreGroupDetailsLink({ group }: { group: ExploreGroup }) {
  return (
    <Link
      {...buildGroupPlanDetailNavigation(group.id, { source: "explore" })}
      aria-label={`View ${group.name} group details`}
      className="block size-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="sr-only">View group details</span>
    </Link>
  );
}
