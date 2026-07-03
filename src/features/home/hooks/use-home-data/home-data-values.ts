import type { HomeQueries } from "@/features/home/hooks/use-home-data/use-home-queries";
import { EMPTY_HOME_STATS } from "@/features/home/lib/home-stats";

const EMPTY_PLANS: never[] = [];
const EMPTY_GROUPS: never[] = [];
const EMPTY_INVITATIONS: never[] = [];
const EMPTY_RECOMMENDATIONS: never[] = [];

export function getHomeDataValues(queries: HomeQueries) {
  return {
    stats: getQueryDataOrDefault(queries.stats.data, EMPTY_HOME_STATS),
    plans: getQueryDataOrDefault(queries.plans.data, EMPTY_PLANS),
    groups: getQueryDataOrDefault(queries.groups.data, EMPTY_GROUPS),
    invitations: getQueryDataOrDefault(
      queries.invitations.data,
      EMPTY_INVITATIONS,
    ),
    sentInvitations: getQueryDataOrDefault(
      queries.sentInvitations.data,
      EMPTY_INVITATIONS,
    ),
    recommendations: getQueryDataOrDefault(
      queries.recommendations.data,
      EMPTY_RECOMMENDATIONS,
    ),
  };
}

function getQueryDataOrDefault<Data>(data: Data | undefined, fallback: Data) {
  return data ?? fallback;
}
