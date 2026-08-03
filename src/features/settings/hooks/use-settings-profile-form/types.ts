import type { NotificationPreferences } from "@/shared/schemas";

export type BooleanSettingsPreferenceKey = Exclude<
  keyof NotificationPreferences,
  | "minCompatibilityScore"
  | "themeAppearance"
  | "themeStyle"
  | "themeColor"
  | "notificationTimeZoneId"
  | "quietHoursStartMinute"
  | "quietHoursEndMinute"
  | "planReminderLeadMinutes"
  | "presencePrecision"
>;
