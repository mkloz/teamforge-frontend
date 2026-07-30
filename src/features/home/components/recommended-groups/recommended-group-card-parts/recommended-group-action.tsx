import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import {
  getJoinedGroupId,
  getRecommendedActionTitle,
  getRecommendedGroupActionState,
  isRecommendedActionDisabled,
} from "@/features/home/components/recommended-groups/recommended-group-card-parts/action-state";
import type { RecommendedGroupActionProps } from "@/features/home/components/recommended-groups/recommended-group-card-parts/types";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { buildActivityGroupHubNavigation } from "@/shared/navigation";

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
          <span className="sr-only sm:not-sr-only">Open group</span>
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
      className={cn(
        "size-9 shrink-0 px-0 sm:h-9 sm:w-auto sm:px-3",
        isFull && "opacity-60",
      )}
      contentClassName="whitespace-nowrap"
    >
      <ActionIcon className="size-3.5" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">{actionState.label}</span>
    </Button>
  );
}
