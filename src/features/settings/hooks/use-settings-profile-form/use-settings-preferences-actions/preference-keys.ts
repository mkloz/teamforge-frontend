import type { NotificationPreferences } from "@/shared/schemas";

export type SettingsPreferenceKey = keyof NotificationPreferences;

const settingsPreferenceKeys = [
  "notifyFriendRequests",
  "notifyGroupInvites",
  "notifyGroupActivity",
  "notifyMessages",
  "notifyAccount",
  "notificationHardMute",
  "notificationTimeZoneId",
  "quietHoursStartMinute",
  "quietHoursEndMinute",
  "planReminderLeadMinutes",
  "presencePrecision",
  "presenceFriendsVisible",
  "presenceGroupsVisible",
  "presencePlanGuestsVisible",
  "emailFriendRequests",
  "emailGroupInvites",
  "emailGroupActivity",
  "emailMessages",
  "emailAccount",
  "autoMatchingEnabled",
  "minCompatibilityScore",
  "themeAppearance",
  "themeStyle",
  "themeColor",
  "showAgeOnProfile",
  "showGenderOnProfile",
  "showCityOnProfile",
  "showFriendsListOnProfile",
] as const satisfies readonly SettingsPreferenceKey[];

export function getChangedPreferenceKeys(
  previousPreferences: NotificationPreferences | undefined,
  nextPreferences: NotificationPreferences,
) {
  if (!previousPreferences) {
    return [...settingsPreferenceKeys];
  }

  return settingsPreferenceKeys.filter(
    (key) => previousPreferences[key] !== nextPreferences[key],
  );
}
