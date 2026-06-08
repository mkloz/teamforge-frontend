import { SettingsQueryOptions } from "@/features/settings/api/settings-query-options";

export const SettingsQueryFactory = {
  notificationPreferences: (
    ...args: Parameters<typeof SettingsQueryOptions.notificationPreferences>
  ) => SettingsQueryOptions.notificationPreferences(...args),
  sessions: (...args: Parameters<typeof SettingsQueryOptions.sessions>) =>
    SettingsQueryOptions.sessions(...args),
  blockedUsers: (
    ...args: Parameters<typeof SettingsQueryOptions.blockedUsers>
  ) => SettingsQueryOptions.blockedUsers(...args),
};
