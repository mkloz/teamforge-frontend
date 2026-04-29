import { AuthQueries } from "@/features/auth/api/auth.queries";
import { appQueryClient } from "@/shared/api/query-client";
import type { User } from "@/shared/schemas";

const LEGACY_ACTIVITY_CURRENT_USER_ID = "current-user";
const LEGACY_ACTIVITY_CURRENT_USER_ID_ALT = "user-current";

export function getActivityCurrentUser() {
  return (
    appQueryClient.getQueryData<User>(AuthQueries.currentUserQueryKey) ?? null
  );
}

export function getActivityCurrentUserId() {
  return getActivityCurrentUser()?.id ?? null;
}

export function isActivityCurrentUserId(userId?: string | null) {
  const currentUserId = getActivityCurrentUserId();

  return (
    userId === currentUserId ||
    userId === LEGACY_ACTIVITY_CURRENT_USER_ID ||
    userId === LEGACY_ACTIVITY_CURRENT_USER_ID_ALT
  );
}
