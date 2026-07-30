import { ExploreGroupDetailsLink } from "@/features/explore/components/explore-feed/explore-group-plan-card/explore-group-details-link";
import { ExploreGroupPlanCardAction } from "@/features/explore/components/explore-feed/explore-group-plan-card/explore-group-plan-card-action";
import { getExploreGroupPlanCardViewState } from "@/features/explore/components/explore-feed/explore-group-plan-card-view-state";
import { useJoinExploreGroup } from "@/features/explore/hooks/use-join-explore-group";
import { GroupPlanCard } from "@/shared/components/group-plan-card";
import type { ExploreGroup } from "@/shared/schemas";
import { ExploreDiscoveryGroupCard } from "./explore-discovery-group-card";

interface ExploreGroupPlanCardProps {
  group: ExploreGroup;
  imagePriority?: "auto" | "high";
  variant?: "default" | "compact" | "discovery";
  emphasis?: "lead" | "standard";
}

export function ExploreGroupPlanCard({
  group,
  imagePriority = "auto",
  variant = "default",
  emphasis = "standard",
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

  if (variant === "discovery") {
    return (
      <ExploreDiscoveryGroupCard
        emphasis={emphasis}
        group={group}
        imagePriority={imagePriority}
        onJoin={handleJoin}
        viewState={viewState}
      />
    );
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
