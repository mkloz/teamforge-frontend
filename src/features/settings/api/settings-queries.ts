import { queryOptions } from "@tanstack/react-query";
import { AccountDataApi } from "@/features/settings/api/account-data.api";
import { SettingsApi } from "@/features/settings/api/settings.api";
import {
  getSettingsAccountExportQueryKey,
  getSettingsAccountLifecycleQueryKey,
  getSettingsAdultEligibilityCorrectionQueryKey,
  SETTINGS_BLOCKED_USERS_QUERY_KEY,
  SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
  SETTINGS_SESSIONS_QUERY_KEY,
} from "@/features/settings/api/settings-query-keys";

export const settingsQueries = {
  accountLifecycle(userId: string) {
    return queryOptions({
      queryKey: getSettingsAccountLifecycleQueryKey(userId),
      queryFn: () => AccountDataApi.getAccountLifecycle(),
      staleTime: 30_000,
    });
  },

  adultEligibilityCorrection(userId: string) {
    return queryOptions({
      queryKey: getSettingsAdultEligibilityCorrectionQueryKey(userId),
      queryFn: () => AccountDataApi.getAdultEligibilityCorrection(),
      staleTime: 30_000,
    });
  },

  accountExport(userId: string) {
    return queryOptions({
      queryKey: getSettingsAccountExportQueryKey(userId),
      queryFn: () => AccountDataApi.getAccountExport(),
      refetchInterval: (query) => {
        const state = query.state.data?.export?.state;

        return state === "QUEUED" || state === "PROCESSING" ? 5_000 : false;
      },
      refetchOnWindowFocus: true,
      staleTime: 5_000,
    });
  },

  notificationPreferences() {
    return queryOptions({
      queryKey: SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
      queryFn: () => SettingsApi.getNotificationPreferences(),
      staleTime: 60_000,
    });
  },

  sessions() {
    return queryOptions({
      queryKey: SETTINGS_SESSIONS_QUERY_KEY,
      queryFn: () => SettingsApi.getSessions(),
      staleTime: 30_000,
    });
  },

  blockedUsers() {
    return queryOptions({
      queryKey: SETTINGS_BLOCKED_USERS_QUERY_KEY,
      queryFn: () => SettingsApi.getBlockedUsers(),
      staleTime: 30_000,
    });
  },
};
