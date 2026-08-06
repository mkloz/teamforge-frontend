import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export const HOME_GROUPS_QUERY_KEY = APP_QUERY_KEYS.home.groups;

export const HOME_INVITATIONS_QUERY_KEY = APP_QUERY_KEYS.home.invitations;

export const HOME_SENT_INVITATIONS_QUERY_KEY =
  APP_QUERY_KEYS.home.sentInvitations;

export const getHomeRecommendationsQueryKey = (
  sessionScope: string,
  projectionScope: string,
) => APP_QUERY_KEYS.home.recommendationsForScope(sessionScope, projectionScope);
