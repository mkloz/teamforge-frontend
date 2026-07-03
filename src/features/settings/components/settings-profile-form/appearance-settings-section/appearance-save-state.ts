import type { NotificationPreferences } from "@/shared/schemas";
import type { ThemeSavingState } from "./appearance-options";

export function getThemeSavingState(
  isSavingNotificationPreferences: boolean,
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>,
): ThemeSavingState {
  return {
    isSavingAppearance:
      isSavingNotificationPreferences ||
      savingNotificationPreferenceKeys.has("themeAppearance"),
    isSavingStyle:
      isSavingNotificationPreferences ||
      savingNotificationPreferenceKeys.has("themeStyle"),
    isSavingColor:
      isSavingNotificationPreferences ||
      savingNotificationPreferenceKeys.has("themeColor"),
  };
}

export function getAppearanceControlsDisabled({
  isLoadingNotificationPreferences,
  isOnline,
  notificationPreferences,
}: {
  isLoadingNotificationPreferences: boolean;
  isOnline: boolean;
  notificationPreferences: NotificationPreferences | null;
}) {
  return (
    !isOnline || isLoadingNotificationPreferences || !notificationPreferences
  );
}

export function getResetDisabledState({
  isDefaultTheme,
  isDisabled,
  isSavingAppearance,
  isSavingStyle,
  isSavingColor,
}: ThemeSavingState & { isDefaultTheme: boolean; isDisabled: boolean }) {
  return [
    isDisabled,
    isSavingAppearance,
    isSavingStyle,
    isSavingColor,
    isDefaultTheme,
  ].some(Boolean);
}

export function getResetLoadingState({
  isDefaultTheme,
  isSavingAppearance,
  isSavingStyle,
  isSavingColor,
}: ThemeSavingState & { isDefaultTheme: boolean }) {
  return (
    !isDefaultTheme && (isSavingAppearance || isSavingStyle || isSavingColor)
  );
}
