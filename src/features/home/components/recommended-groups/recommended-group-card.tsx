import { useJoinHomeRecommendedGroup } from "@/features/home/hooks/use-join-home-recommended-group";
import { GroupPlanCard } from "@/shared/components/group-plan-card";
import { isExploreGroupFull } from "@/shared/lib/explore-group-presenters";
import type { ExploreGroup } from "@/shared/schemas";

import {
  RecommendedGroupAction,
  RecommendedGroupDetailsLink,
} from "./recommended-group-card-parts";

interface RecommendedGroupCardProps {
  group: ExploreGroup;
}

export function RecommendedGroupCard({ group }: RecommendedGroupCardProps) {
  const joinMutation = useJoinHomeRecommendedGroup(group.id);
  const isFull = isExploreGroupFull(group);

  return (
    <GroupPlanCard
      group={group}
      variant="compact"
      action={
        <RecommendedGroupAction
          group={group}
          isFull={isFull}
          joinMutation={joinMutation}
        />
      }
      detailsLink={<RecommendedGroupDetailsLink group={group} />}
    />
  );
}
