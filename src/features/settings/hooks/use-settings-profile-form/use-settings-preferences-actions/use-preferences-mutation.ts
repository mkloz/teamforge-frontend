import { useMutation } from "@tanstack/react-query";

import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { getChangedPreferenceKeys } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/preference-keys";
import type { PreferencesMutationContext } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/preferences-mutation-context";
import { rollbackChangedPreferenceKeys } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/rollback-preferences";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { NotificationPreferences } from "@/shared/schemas";
import { useThemeStore } from "@/shared/store/theme.store";

type UpdateNotificationPreferencesResult = Awaited<
  ReturnType<typeof SettingsCommands.updateNotificationPreferences>
>;

export function usePreferencesMutation({
  setPreferencesError,
}: {
  setPreferencesError: (error: string | null) => void;
}) {
  return useMutation<
    UpdateNotificationPreferencesResult,
    Error,
    NotificationPreferences,
    PreferencesMutationContext
  >({
    meta: {
      errorToastMessage: "We couldn't update your settings right now.",
      telemetryName: trackedMutationNames.settingsNotificationPreferences,
    },
    mutationFn: (
      payload: Parameters<
        typeof SettingsCommands.updateNotificationPreferences
      >[0],
    ) => SettingsCommands.updateNotificationPreferences(payload),
    onMutate: async (nextPreferences) => {
      await SettingsCache.cancelNotificationPreferences();

      const previousPreferences =
        SettingsCache.getNotificationPreferencesSnapshot();
      const changedKeys = getChangedPreferenceKeys(
        previousPreferences,
        nextPreferences,
      );

      SettingsCache.setNotificationPreferences(nextPreferences);
      useThemeStore.getState().setThemePreferences(nextPreferences);

      return {
        changedKeys,
        optimisticPreferences: nextPreferences,
        previousPreferences,
      } satisfies PreferencesMutationContext;
    },
    onSuccess: (result) => {
      SettingsCache.setNotificationPreferences(result.data);
      useThemeStore.getState().setThemePreferences(result.data);
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
    onError: (error, _payload, context) => {
      SettingsCache.restoreNotificationPreferences(
        rollbackChangedPreferenceKeys(
          SettingsCache.getNotificationPreferencesSnapshot(),
          context,
        ),
      );
      if (context?.previousPreferences) {
        useThemeStore
          .getState()
          .setThemePreferences(context.previousPreferences);
      }
      setPreferencesError(
        getApiErrorMessage(
          error,
          "We couldn't update your settings right now.",
        ),
      );
    },
    onSettled: async () => {
      await SettingsCache.invalidateNotificationPreferences();
    },
  });
}
