import { queryOptions } from "@tanstack/react-query";
import { HomeApi } from "@/features/home/api/home.api";
import {
  HOME_GROUPS_QUERY_KEY,
  HOME_INVITATIONS_QUERY_KEY,
  HOME_RECOMMENDATIONS_QUERY_KEY,
  HOME_SENT_INVITATIONS_QUERY_KEY,
} from "@/features/home/api/home-query-keys";
import type {
  PlannedGroup,
  UserStats,
} from "@/features/home/lib/home-contract";
import { getActivePlannedGroups } from "@/features/home/lib/home-plans";
import { buildHomeStats } from "@/features/home/lib/home-stats";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export const homeQueries = {
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
      queryFn: () => HomeApi.getRecommendations(),
      refetchInterval: (query) =>
        query.state.data?.some((item) => item.type === "FORMATION_OPENING")
          ? 15_000
          : false,
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

  stats() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.home.stats,
      queryFn: async (): Promise<UserStats> => {
        const [currentUser, groups] = await Promise.all([
          appQueryClient.ensureQueryData(currentUserQueryOptions()),
          appQueryClient.ensureQueryData(homeQueries.groups()),
        ]);

        return buildHomeStats(currentUser, groups);
      },
      retry: false,
      staleTime: 60_000,
    });
  },

  plans() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.home.plans,
      queryFn: async (): Promise<PlannedGroup[]> => {
        const groups = await appQueryClient.ensureQueryData(
          homeQueries.groups(),
        );

        return getActivePlannedGroups(groups);
      },
      retry: false,
      staleTime: 60_000,
    });
  },
};
