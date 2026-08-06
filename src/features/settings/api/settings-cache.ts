import {
  getSettingsAccountExportQueryKey,
  getSettingsAdultEligibilityCorrectionQueryKey,
  SETTINGS_ACCOUNT_DATA_QUERY_KEY,
  SETTINGS_BLOCKED_USERS_QUERY_KEY,
  SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
  SETTINGS_SESSIONS_QUERY_KEY,
} from "@/features/settings/api/settings-query-keys";
import type {
  AccountExportResponse,
  AdultEligibilityCorrectionResponse,
} from "@/features/settings/schemas/account-data.schema";
import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-cache";
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
  invalidateCurrentUser() {
    return appQueryClient.invalidateQueries({
      queryKey: CURRENT_USER_QUERY_KEY,
    });
  },

  setAdultEligibilityCorrection(
    userId: string,
    correction: AdultEligibilityCorrectionResponse,
  ) {
    appQueryClient.setQueryData(
      getSettingsAdultEligibilityCorrectionQueryKey(userId),
      correction,
    );
  },

  setAccountExport(userId: string, accountExport: AccountExportResponse) {
    appQueryClient.setQueryData(
      getSettingsAccountExportQueryKey(userId),
      accountExport,
    );
  },

  markAccountExportConsumed(userId: string) {
    appQueryClient.setQueryData<AccountExportResponse>(
      getSettingsAccountExportQueryKey(userId),
      (current) =>
        current?.export
          ? {
              export: {
                ...current.export,
                state: "CONSUMED",
                canDownload: false,
              },
            }
          : current,
    );
  },

  invalidateAccountExport(userId: string) {
    return appQueryClient.invalidateQueries({
      queryKey: getSettingsAccountExportQueryKey(userId),
    });
  },

  removeAccountData() {
    appQueryClient.removeQueries({ queryKey: SETTINGS_ACCOUNT_DATA_QUERY_KEY });
  },

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
