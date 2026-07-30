import { useEffect } from "react";
import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import type { NotificationPreferences } from "@/shared/schemas";
import { useTheme } from "@/shared/store/theme.store";
import { AppearanceColorPicker } from "./appearance-color-picker";
import { AppearanceModePicker } from "./appearance-mode-picker";
import {
  DEFAULT_THEME_PREFERENCES,
  type ThemePreferenceValues,
} from "./appearance-options";
import { AppearancePreview } from "./appearance-preview";
import {
  getAppearanceControlsDisabled,
  getResetDisabledState,
  getResetLoadingState,
  getThemeSavingState,
} from "./appearance-save-state";
import { getThemeSelectionState } from "./appearance-selection-state";
import { AppearanceStylePicker } from "./appearance-style-picker";

interface AppearanceSettingsSectionProps {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  isOnline: boolean;
  onChange: (
    values: Pick<
      NotificationPreferences,
      "themeAppearance" | "themeStyle" | "themeColor"
    >,
  ) => Promise<void>;
}

export function AppearanceSettingsSection({
  notificationPreferences,
  isLoadingNotificationPreferences,
  isSavingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  isOnline,
  onChange,
}: AppearanceSettingsSectionProps) {
  const { appearance, themeStyle, themeColor, isDark, setThemePreferences } =
    useTheme();

  const selection = getThemeSelectionState(notificationPreferences, {
    themeAppearance: appearance,
    themeStyle,
    themeColor,
  });

  const savingState = getThemeSavingState(
    isSavingNotificationPreferences,
    savingNotificationPreferenceKeys,
  );

  const isDisabled = getAppearanceControlsDisabled({
    isLoadingNotificationPreferences,
    isOnline,
    notificationPreferences,
  });

  const isResetDisabled = getResetDisabledState({
    isDefaultTheme: selection.isDefaultTheme,
    isDisabled,
    ...savingState,
  });
  const isSavingTheme =
    savingState.isSavingAppearance ||
    savingState.isSavingStyle ||
    savingState.isSavingColor;

  useEffect(() => {
    if (!notificationPreferences) {
      return;
    }

    setThemePreferences({
      themeAppearance: notificationPreferences.themeAppearance,
      themeStyle: notificationPreferences.themeStyle,
      themeColor: notificationPreferences.themeColor,
    });
  }, [notificationPreferences, setThemePreferences]);

  function saveThemePreference(values: ThemePreferenceValues) {
    if (!notificationPreferences || isDisabled) {
      return;
    }

    setThemePreferences(values);
    void onChange(values);
  }

  function saveThemePreferencePatch(values: Partial<ThemePreferenceValues>) {
    saveThemePreference({
      themeAppearance: selection.themeAppearance,
      themeStyle: selection.themeStyle,
      themeColor: selection.themeColor,
      ...values,
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <PreferenceStatusMessage error={error} />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing appearance settings." />
      ) : null}

      <AppearancePreview
        isDark={isDark}
        isResetDisabled={isResetDisabled}
        isResetting={getResetLoadingState({
          isDefaultTheme: selection.isDefaultTheme,
          ...savingState,
        })}
        isSaving={isSavingTheme}
        selection={selection}
        onReset={() => {
          saveThemePreference(DEFAULT_THEME_PREFERENCES);
        }}
      />

      <AppearanceModePicker
        selectedAppearance={selection.themeAppearance}
        disabled={isDisabled || savingState.isSavingAppearance}
        onSelect={(nextAppearance) => {
          saveThemePreferencePatch({ themeAppearance: nextAppearance });
        }}
      />

      <AppearanceStylePicker
        selectedStyle={selection.themeStyle}
        disabled={isDisabled || savingState.isSavingStyle}
        onSelect={(nextThemeStyle) => {
          saveThemePreferencePatch({ themeStyle: nextThemeStyle });
        }}
      />

      <AppearanceColorPicker
        isDark={isDark}
        selectedColor={selection.themeColor}
        disabled={isDisabled || savingState.isSavingColor}
        onSelect={(nextThemeColor) => {
          saveThemePreferencePatch({ themeColor: nextThemeColor });
        }}
      />
    </section>
  );
}
