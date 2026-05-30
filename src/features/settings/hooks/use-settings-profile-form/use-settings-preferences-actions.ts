import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { SettingsQueryFactory } from "@/features/settings/api/settings-query-factory";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { NotificationPreferences } from "@/shared/schemas";

import type { BooleanSettingsPreferenceKey } from "./types";

interface UseSettingsPreferencesActionsOptions {
  enabled: boolean;
}

export function useSettingsPreferencesActions({
  enabled,
}: UseSettingsPreferencesActionsOptions) {
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  const notificationPreferencesQuery = useQuery({
    ...SettingsQueryFactory.notificationPreferences(),
    enabled,
  });

  const preferencesMutation = useMutation({
    meta: {
      errorToastMessage:
        "We couldn't update your notification preferences right now.",
      telemetryName: trackedMutationNames.settingsNotificationPreferences,
    },
    mutationFn: (
      payload: Parameters<
        typeof SettingsCommands.updateNotificationPreferences
      >[0],
    ) => SettingsCommands.updateNotificationPreferences(payload),
    onSuccess: (result) => {
      SettingsCache.setNotificationPreferences(result.data);
      setPreferencesError(null);
      showAppSuccessToast("Settings updated.", {
        id: "settings-preferences-updated",
      });
      trackMutationOutcome(
        trackedMutationNames.settingsNotificationPreferences,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
      setPreferencesError(
        getApiErrorMessage(
          error,
          "We couldn't update your notification preferences right now.",
        ),
      );
    },
  });

  async function updateNotificationPreference(
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) {
    const currentPreferences = notificationPreferencesQuery.data;

    if (!currentPreferences) {
      return;
    }

    setPreferencesError(null);

    await preferencesMutation.mutateAsync({
      ...currentPreferences,
      [key]: value,
    });
  }

  async function updateMatchingPreference(
    values: Pick<
      NotificationPreferences,
      "autoMatchingEnabled" | "minCompatibilityScore"
    >,
  ) {
    const currentPreferences = notificationPreferencesQuery.data;

    if (!currentPreferences) {
      return;
    }

    setPreferencesError(null);

    await preferencesMutation.mutateAsync({
      ...currentPreferences,
      ...values,
    });
  }

  async function updatePrivacyPreference(
    values: Pick<
      NotificationPreferences,
      "showAgeOnProfile" | "showGenderOnProfile" | "showCityOnProfile"
    >,
  ) {
    const currentPreferences = notificationPreferencesQuery.data;

    if (!currentPreferences) {
      return;
    }

    setPreferencesError(null);

    await preferencesMutation.mutateAsync({
      ...currentPreferences,
      ...values,
    });
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
    updateMatchingPreference,
    updatePrivacyPreference,
    isSavingNotificationPreferences: preferencesMutation.isPending,
  };
}
