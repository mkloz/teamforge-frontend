import { queryOptions } from "@tanstack/react-query";

import { SettingsApi } from "@/features/settings/api/settings.api";
import {
  SETTINGS_BLOCKED_USERS_QUERY_KEY,
  SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
  SETTINGS_SESSIONS_QUERY_KEY,
} from "@/features/settings/api/settings-query-keys";

export const SettingsQueryOptions = {
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
