import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { Button } from "@/shared/components/ui/button";
import type { NotificationPreferences } from "@/shared/schemas";
import { useTheme } from "@/shared/store/theme.store";

import {
  DEFAULT_THEME_PREFERENCES,
  type ThemePreferenceValues,
} from "./appearance-options";
import {
  getAppearanceControlsDisabled,
  getResetDisabledState,
  getResetLoadingState,
  getThemeSavingState,
} from "./appearance-save-state";
import { getThemeSelectionState } from "./appearance-selection-state";
import { ColorLayer } from "./color-layer";
import { ModeLayer } from "./mode-layer";
import { StyleLayer } from "./style-layer";

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
    <section className="flex max-w-4xl flex-col gap-7">
      <PreferenceStatusMessage error={error} />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing appearance settings." />
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="subtle"
          size="xs"
          disabled={isResetDisabled}
          loading={getResetLoadingState({
            isDefaultTheme: selection.isDefaultTheme,
            ...savingState,
          })}
          onClick={() => {
            saveThemePreference(DEFAULT_THEME_PREFERENCES);
          }}
        >
          <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
          Reset defaults
        </Button>
      </div>

      <div className="flex flex-col gap-9">
        <ModeLayer
          selectedAppearance={selection.themeAppearance}
          disabled={isDisabled || savingState.isSavingAppearance}
          onSelect={(nextAppearance) => {
            saveThemePreferencePatch({ themeAppearance: nextAppearance });
          }}
        />

        <StyleLayer
          selectedThemeStyle={selection.themeStyle}
          disabled={isDisabled || savingState.isSavingStyle}
          onSelect={(nextThemeStyle) => {
            saveThemePreferencePatch({ themeStyle: nextThemeStyle });
          }}
        />

        <ColorLayer
          isDark={isDark}
          selectedThemeColor={selection.themeColor}
          disabled={isDisabled || savingState.isSavingColor}
          onSelect={(nextThemeColor) => {
            saveThemePreferencePatch({ themeColor: nextThemeColor });
          }}
        />
      </div>
    </section>
  );
}
