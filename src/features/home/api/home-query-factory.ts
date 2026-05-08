import { queryOptions } from "@tanstack/react-query";
import { HomeQueryOptions } from "@/features/home/api/home-query-options";
import type {
  PlannedGroup,
  UserStats,
} from "@/features/home/lib/home-contract";
import { getActivePlannedGroups } from "@/features/home/lib/home-plans";
import { buildHomeStats } from "@/features/home/lib/home-stats";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export const HomeQueryFactory = {
  groups: (...args: Parameters<typeof HomeQueryOptions.groups>) =>
    HomeQueryOptions.groups(...args),
  invitations: (...args: Parameters<typeof HomeQueryOptions.invitations>) =>
    HomeQueryOptions.invitations(...args),
  recommendations: (
    ...args: Parameters<typeof HomeQueryOptions.recommendations>
  ) => HomeQueryOptions.recommendations(...args),
  sentInvitations: (
    ...args: Parameters<typeof HomeQueryOptions.sentInvitations>
  ) => HomeQueryOptions.sentInvitations(...args),

  stats() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.home.stats,
      queryFn: async (): Promise<UserStats> => {
        const [currentUser, groups] = await Promise.all([
          appQueryClient.ensureQueryData(currentUserQueryOptions()),
          appQueryClient.ensureQueryData(HomeQueryOptions.groups()),
        ]);

        return buildHomeStats(currentUser, groups);
      },
      staleTime: 60_000,
    });
  },

  plans() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.home.plans,
      queryFn: async (): Promise<PlannedGroup[]> => {
        const groups = await appQueryClient.ensureQueryData(
          HomeQueryOptions.groups(),
        );

        return getActivePlannedGroups(groups);
      },
      staleTime: 60_000,
    });
  },
};
