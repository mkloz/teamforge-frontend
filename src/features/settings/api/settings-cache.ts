import {
  SETTINGS_BLOCKED_USERS_QUERY_KEY,
  SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
  SETTINGS_SESSIONS_QUERY_KEY,
} from "@/features/settings/api/settings-query-keys";
import { appQueryClient } from "@/shared/api/query-client";
import { invalidateUserBlockSurfaces } from "@/shared/api/query-invalidation";
import type {
  AuthSession,
  NotificationPreferences,
  UserBlockApi,
} from "@/shared/schemas";

function removeSessionFromList(
  sessions: AuthSession[] | undefined,
  sessionId: string,
) {
  return sessions?.filter((session) => session.id !== sessionId) ?? [];
}

function removeBlockedUser(
  blockedUsers: UserBlockApi[] | undefined,
  userId: string,
) {
  return blockedUsers?.filter((block) => block.id !== userId) ?? [];
}

export const SettingsCache = {
  setNotificationPreferences(preferences: NotificationPreferences) {
    appQueryClient.setQueryData(
      SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
      preferences,
    );
  },

  async cancelNotificationPreferences() {
    await appQueryClient.cancelQueries({
      queryKey: SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
    });
  },

  getNotificationPreferencesSnapshot() {
    return appQueryClient.getQueryData<NotificationPreferences>(
      SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
    );
  },

  restoreNotificationPreferences(
    preferences: NotificationPreferences | undefined,
  ) {
    appQueryClient.setQueryData(
      SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
      preferences,
    );
  },

  invalidateNotificationPreferences() {
    return appQueryClient.invalidateQueries({
      queryKey: SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
    });
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
    return appQueryClient.getQueryData<UserBlockApi[]>(
      SETTINGS_BLOCKED_USERS_QUERY_KEY,
    );
  },

  removeBlockedUser(userId: string) {
    appQueryClient.setQueryData<UserBlockApi[]>(
      SETTINGS_BLOCKED_USERS_QUERY_KEY,
      (current) => removeBlockedUser(current, userId),
    );
  },

  restoreBlockedUsers(blockedUsers: UserBlockApi[] | undefined) {
    appQueryClient.setQueryData(SETTINGS_BLOCKED_USERS_QUERY_KEY, blockedUsers);
  },

  async invalidateBlockedUserSurfaces() {
    await invalidateUserBlockSurfaces();
  },
};
