import { SettingsQueryOptions } from "@/features/settings/api/settings-query-options";

export const SettingsQueryFactory = {
  notificationPreferences: SettingsQueryOptions.notificationPreferences,
  sessions: SettingsQueryOptions.sessions,
  blockedUsers: SettingsQueryOptions.blockedUsers,
};
