import { queryOptions } from "@tanstack/react-query";
import { HomeApi } from "@/features/home/api/home.api";
import {
  HOME_GROUPS_QUERY_KEY,
  HOME_INVITATIONS_QUERY_KEY,
  HOME_RECOMMENDATIONS_QUERY_KEY,
  HOME_SENT_INVITATIONS_QUERY_KEY,
} from "@/features/home/api/home-query-keys";
import { getExploreGroupMatchScore } from "@/shared/lib/explore-group-presenters";

export const HomeQueryOptions = {
  groups() {
    return queryOptions({
      queryKey: HOME_GROUPS_QUERY_KEY,
      queryFn: () => HomeApi.getGroups(),
      staleTime: 60_000,
    });
  },

  invitations() {
    return queryOptions({
      queryKey: HOME_INVITATIONS_QUERY_KEY,
      queryFn: () => HomeApi.getInvitations(),
      staleTime: 60_000,
    });
  },

  recommendations() {
    return queryOptions({
      queryKey: HOME_RECOMMENDATIONS_QUERY_KEY,
      queryFn: async () => {
        const groups = await HomeApi.getRecommendations();

        return [...groups].sort(
          (left, right) =>
            getExploreGroupMatchScore(right) - getExploreGroupMatchScore(left),
        );
      },
      staleTime: 60_000,
    });
  },

  sentInvitations() {
    return queryOptions({
      queryKey: HOME_SENT_INVITATIONS_QUERY_KEY,
      queryFn: () => HomeApi.getSentInvitations(),
      staleTime: 60_000,
    });
  },
};
