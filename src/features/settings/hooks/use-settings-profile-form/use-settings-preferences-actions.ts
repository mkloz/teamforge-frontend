import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { settingsQueries } from "@/features/settings/api/settings-queries";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/hooks/use-settings-profile-form/types";
import { getChangedPreferenceKeys } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/preference-keys";
import {
  getSavingPreferenceKeysWithChanges,
  type SettingsPreferenceKey,
} from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/saving-preference-keys";
import { usePreferencesMutation } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/use-preferences-mutation";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import type { NotificationPreferences } from "@/shared/schemas";

interface UseSettingsPreferencesActionsOptions {
  enabled: boolean;
}

export function useSettingsPreferencesActions({
  enabled,
}: UseSettingsPreferencesActionsOptions) {
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [savingPreferenceKeys, setSavingPreferenceKeys] = useState<
    ReadonlySet<SettingsPreferenceKey>
  >(new Set());
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const notificationPreferencesQuery = useQuery({
    ...settingsQueries.notificationPreferences(),
    enabled,
  });

  const preferencesMutation = usePreferencesMutation({
    setPreferencesError,
  });

  async function saveNotificationPreferences(
    nextPreferences: NotificationPreferences,
  ) {
    const changedKeys = getChangedPreferenceKeys(
      notificationPreferencesQuery.data,
      nextPreferences,
    );

    if (changedKeys.length === 0) {
      return;
    }

    if (
      guardOfflineAction({
        id: "settings-preferences-offline",
        description: "Reconnect before saving settings changes.",
      })
    ) {
      setPreferencesError(
        "You are offline. Reconnect before saving settings changes.",
      );
      return;
    }

    setSavingPreferenceKeys((current) =>
      getSavingPreferenceKeysWithChanges(current, changedKeys, true),
    );
    setPreferencesError(null);

    try {
      await preferencesMutation.mutateAsync(nextPreferences);
    } finally {
      setSavingPreferenceKeys((current) =>
        getSavingPreferenceKeysWithChanges(current, changedKeys, false),
      );
    }
  }

  async function saveNotificationPreferencePatch(
    values: Partial<NotificationPreferences>,
  ) {
    const currentPreferences = notificationPreferencesQuery.data;

    if (!currentPreferences) {
      return;
    }

    await saveNotificationPreferences({
      ...currentPreferences,
      ...values,
    });
  }

  async function saveSingleNotificationPreference<
    Key extends BooleanSettingsPreferenceKey,
  >(key: Key, value: NotificationPreferences[Key]) {
    const currentPreferences = notificationPreferencesQuery.data;

    if (!currentPreferences) {
      return;
    }

    await saveNotificationPreferences({
      ...currentPreferences,
      [key]: value,
    });
  }

  async function updateNotificationPreference(
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) {
    await saveSingleNotificationPreference(key, value);
  }

  async function updateNotificationSchedulePreference(
    values: Partial<
      Pick<
        NotificationPreferences,
        | "notificationHardMute"
        | "notificationTimeZoneId"
        | "quietHoursStartMinute"
        | "quietHoursEndMinute"
        | "planReminderLeadMinutes"
      >
    >,
  ) {
    await saveNotificationPreferencePatch(values);
  }

  async function updateMatchingPreference(
    values: Pick<NotificationPreferences, "minCompatibilityScore">,
  ) {
    await saveNotificationPreferencePatch(values);
  }

  async function updatePrivacyPreference(
    values: Partial<
      Pick<
        NotificationPreferences,
        | "showAgeOnProfile"
        | "showGenderOnProfile"
        | "showCityOnProfile"
        | "showFriendsListOnProfile"
        | "presencePrecision"
        | "presenceFriendsVisible"
        | "presenceGroupsVisible"
        | "presencePlanGuestsVisible"
      >
    >,
  ) {
    await saveNotificationPreferencePatch(values);
  }

  async function updateAppearancePreference(
    values: Pick<
      NotificationPreferences,
      "themeAppearance" | "themeStyle" | "themeColor"
    >,
  ) {
    await saveNotificationPreferencePatch(values);
  }

  return {
    notificationPreferences: notificationPreferencesQuery.data ?? null,
    isLoadingNotificationPreferences: notificationPreferencesQuery.isLoading,
    notificationPreferencesError:
      preferencesError ??
      (notificationPreferencesQuery.isError
        ? "We couldn't load your notification preferences right now."
        : null),
    updateNotificationPreference,
    updateNotificationSchedulePreference,
    updateMatchingPreference,
    updatePrivacyPreference,
    updateAppearancePreference,
    isSavingNotificationPreferences: preferencesMutation.isPending,
    savingNotificationPreferenceKeys: savingPreferenceKeys,
    isOnline,
  };
}
