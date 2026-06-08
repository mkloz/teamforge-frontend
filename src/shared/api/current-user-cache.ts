import { appQueryClient } from "@/shared/api/query-client";
import type { User } from "@/shared/schemas";

import { APP_QUERY_KEYS } from "./query-keys";

export const CURRENT_USER_QUERY_KEY = APP_QUERY_KEYS.auth.currentUser;

export function getCachedCurrentUser() {
  return appQueryClient.getQueryData<User>(CURRENT_USER_QUERY_KEY) ?? null;
}

export function clearCurrentUserCache() {
  appQueryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
}
