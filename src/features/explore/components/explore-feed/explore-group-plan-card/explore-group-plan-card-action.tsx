import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CircleDashed,
  MessageCircle,
  Send,
  UsersRound,
} from "lucide-react";

import type {
  ExploreGroupPlanCardActionIcon,
  ExploreGroupPlanCardViewState,
} from "@/features/explore/components/explore-feed/explore-group-plan-card-view-state";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { buildActivityGroupHubNavigation } from "@/shared/navigation";

interface ExploreGroupPlanCardActionProps {
  isCompact: boolean;
  onJoin: () => void;
  viewState: ExploreGroupPlanCardViewState;
}

const actionIconByState = {
  arrow: ArrowRight,
  check: Check,
  pending: CircleDashed,
  request: Send,
  users: UsersRound,
} satisfies Record<ExploreGroupPlanCardActionIcon, typeof ArrowRight>;

export function ExploreGroupPlanCardAction({
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
