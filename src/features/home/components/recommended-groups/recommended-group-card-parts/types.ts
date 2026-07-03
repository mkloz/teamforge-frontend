import type { LucideIcon } from "lucide-react";

import type { ExploreGroup, ExploreJoinResult } from "@/shared/schemas";

export type JoinResultStatus = ExploreJoinResult["status"];
export type JoinMutationData = { data: ExploreJoinResult } | undefined;
export type RecommendedGroupAccess = ExploreGroup["access"];

export interface HomeRecommendedJoinMutation {
  data: JoinMutationData;
  isOnline: boolean;
  isPending: boolean;
  mutate: () => void;
}

export interface RecommendedGroupActionState {
  ActionIcon: LucideIcon;
  joinResult: JoinResultStatus | undefined;
  label: string;
}

export interface RecommendedGroupActionProps {
  group: ExploreGroup;
  isFull: boolean;
  joinMutation: HomeRecommendedJoinMutation;
}

export interface RecommendedGroupDetailsLinkProps {
  group: ExploreGroup;
}

export interface RecommendedGroupActionChoiceInput {
  group: ExploreGroup;
  isFull: boolean;
  isOfflineActionBlocked: boolean;
  isPending: boolean;
  joinResult: JoinResultStatus | undefined;
}
