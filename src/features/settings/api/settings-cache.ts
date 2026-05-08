import {
  SETTINGS_BLOCKED_USERS_QUERY_KEY,
  SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
  SETTINGS_SESSIONS_QUERY_KEY,
} from "@/features/settings/api/settings-query-keys";
import { appQueryClient } from "@/shared/api/query-client";
import { invalidateFriendshipSurfaces } from "@/shared/api/query-invalidation";
import type {
  AuthSession,
  FriendshipApi,
  NotificationPreferences,
} from "@/shared/schemas";

function removeSessionFromList(
  sessions: AuthSession[] | undefined,
  sessionId: string,
) {
  return sessions?.filter((session) => session.id !== sessionId) ?? [];
}

function removeBlockedUser(
  blockedUsers: FriendshipApi[] | undefined,
  userId: string,
) {
  return (
    blockedUsers?.filter(
      (friendship) =>
        friendship.counterpart.id !== userId &&
        friendship.receiverId !== userId,
    ) ?? []
  );
}

export const SettingsCache = {
  setNotificationPreferences(preferences: NotificationPreferences) {
    appQueryClient.setQueryData(
      SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
      preferences,
    );
  },

  invalidateSessions() {
    return appQueryClient.invalidateQueries({
      queryKey: SETTINGS_SESSIONS_QUERY_KEY,
    });
  },

  getSessionsSnapshot() {
    return appQueryClient.getQueryData<AuthSession[]>(
      SETTINGS_SESSIONS_QUERY_KEY,
    );
  },

  removeSession(sessionId: string) {
    appQueryClient.setQueryData<AuthSession[]>(
      SETTINGS_SESSIONS_QUERY_KEY,
      (current) => removeSessionFromList(current, sessionId),
    );
  },

  keepOnlyCurrentSession() {
    appQueryClient.setQueryData<AuthSession[]>(
      SETTINGS_SESSIONS_QUERY_KEY,
      (current) => current?.filter((session) => session.isCurrent) ?? [],
    );
  },

  restoreSessions(sessions: AuthSession[] | undefined) {
    appQueryClient.setQueryData<AuthSession[]>(
      SETTINGS_SESSIONS_QUERY_KEY,
      sessions ?? [],
    );
  },

  async cancelBlockedUsers() {
    await appQueryClient.cancelQueries({
      queryKey: SETTINGS_BLOCKED_USERS_QUERY_KEY,
    });
  },

  getBlockedUsersSnapshot() {
    return appQueryClient.getQueryData<FriendshipApi[]>(
      SETTINGS_BLOCKED_USERS_QUERY_KEY,
    );
  },

  removeBlockedUser(userId: string) {
    appQueryClient.setQueryData<FriendshipApi[]>(
      SETTINGS_BLOCKED_USERS_QUERY_KEY,
      (current) => removeBlockedUser(current, userId),
    );
  },

  restoreBlockedUsers(blockedUsers: FriendshipApi[] | undefined) {
    appQueryClient.setQueryData(SETTINGS_BLOCKED_USERS_QUERY_KEY, blockedUsers);
  },

  async invalidateBlockedUserSurfaces() {
    await Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: SETTINGS_BLOCKED_USERS_QUERY_KEY,
      }),
      invalidateFriendshipSurfaces(),
    ]);
  },
};
