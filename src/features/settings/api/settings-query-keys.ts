import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export const SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY =
  APP_QUERY_KEYS.settings.notificationPreferences;

export const SETTINGS_SESSIONS_QUERY_KEY = APP_QUERY_KEYS.settings.sessions;

export const SETTINGS_BLOCKED_USERS_QUERY_KEY =
  APP_QUERY_KEYS.settings.blockedUsers;

export const SETTINGS_ACCOUNT_DATA_QUERY_KEY =
  APP_QUERY_KEYS.settings.accountData;

export const getSettingsAccountLifecycleQueryKey = (userId: string) =>
  APP_QUERY_KEYS.settings.accountLifecycle(userId);

export const getSettingsAdultEligibilityCorrectionQueryKey = (userId: string) =>
  APP_QUERY_KEYS.settings.adultEligibilityCorrection(userId);

export const getSettingsAccountExportQueryKey = (userId: string) =>
  APP_QUERY_KEYS.settings.accountExport(userId);
