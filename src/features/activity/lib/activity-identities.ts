import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { User } from "@/shared/schemas";

function getActivityCurrentUser() {
  return (
    appQueryClient.getQueryData<User>(APP_QUERY_KEYS.auth.currentUser) ?? null
  );
}

export function getActivityCurrentUserId() {
  return getActivityCurrentUser()?.id ?? null;
}

export function isActivityCurrentUserId(userId?: string | null) {
  const currentUserId = getActivityCurrentUserId();

  return currentUserId !== null && userId === currentUserId;
}
