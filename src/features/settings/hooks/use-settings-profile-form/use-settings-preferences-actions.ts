import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { NotificationPreferences } from "@/shared/schemas";

import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { SettingsQueryFactory } from "@/features/settings/api/settings-query-factory";

import type { BooleanSettingsPreferenceKey } from "./types";

interface UseSettingsPreferencesActionsOptions {
  enabled: boolean;
}

export function useSettingsPreferencesActions({
  enabled,
}: UseSettingsPreferencesActionsOptions) {
  const [preferencesMessage, setPreferencesMessage] = useState<string | null>(
    null,
  );
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  const notificationPreferencesQuery = useQuery({
    ...SettingsQueryFactory.notificationPreferences(),
    enabled,
  });

  const preferencesMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsNotificationPreferences,
    },
    mutationFn: SettingsCommands.updateNotificationPreferences,
    onSuccess: (result) => {
      SettingsCache.setNotificationPreferences(result.data);
      setPreferencesError(null);
      setPreferencesMessage("Notification preferences updated.");
      trackMutationOutcome(
        trackedMutationNames.settingsNotificationPreferences,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
      setPreferencesMessage(null);
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

    setPreferencesMessage(null);
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

    setPreferencesMessage(null);
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

    setPreferencesMessage(null);
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
    notificationPreferencesMessage: preferencesMessage,
    updateNotificationPreference,
    updateMatchingPreference,
    updatePrivacyPreference,
    isSavingNotificationPreferences: preferencesMutation.isPending,
  };
}
