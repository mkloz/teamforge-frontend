import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { User } from "@/shared/schemas";

const LEGACY_ACTIVITY_CURRENT_USER_ID = "current-user";
const LEGACY_ACTIVITY_CURRENT_USER_ID_ALT = "user-current";

function getActivityCurrentUser() {
  return (
    appQueryClient.getQueryData<User>(APP_QUERY_KEYS.auth.currentUser) ?? null
  );
}

function getActivityCurrentUserId() {
  return getActivityCurrentUser()?.id ?? null;
}

export function isLegacyActivityCurrentUserId(userId?: string | null) {
  return (
    userId === LEGACY_ACTIVITY_CURRENT_USER_ID ||
    userId === LEGACY_ACTIVITY_CURRENT_USER_ID_ALT
  );
}

export function isActivityCurrentUserId(userId?: string | null) {
  const currentUserId = getActivityCurrentUserId();

  return userId === currentUserId || isLegacyActivityCurrentUserId(userId);
}
