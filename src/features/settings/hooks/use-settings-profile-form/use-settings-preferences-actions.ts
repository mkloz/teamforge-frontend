import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { SettingsQueryFactory } from "@/features/settings/api/settings-query-factory";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { NotificationPreferences } from "@/shared/schemas";
import { useThemeStore } from "@/shared/store/theme.store";

import type { BooleanSettingsPreferenceKey } from "./types";

interface UseSettingsPreferencesActionsOptions {
  enabled: boolean;
}

type SettingsPreferenceKey = keyof NotificationPreferences;

const settingsPreferenceKeys = [
  "notifyFriendRequests",
  "notifyGroupInvites",
  "notifyGroupActivity",
  "notifyMessages",
  "notifyAccount",
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

interface PreferencesMutationContext {
  changedKeys: SettingsPreferenceKey[];
  optimisticPreferences: NotificationPreferences;
  previousPreferences: NotificationPreferences | undefined;
}

type UpdateNotificationPreferencesResult = Awaited<
  ReturnType<typeof SettingsCommands.updateNotificationPreferences>
>;

function getChangedPreferenceKeys(
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

function rollbackChangedPreferenceKeys(
  currentPreferences: NotificationPreferences | undefined,
  context: PreferencesMutationContext | undefined,
): NotificationPreferences | undefined {
  const rollbackContext = getRollbackContext(currentPreferences, context);

  if (!rollbackContext) {
    return getRollbackPreferencesFallback(currentPreferences, context);
  }

  return restoreChangedPreferenceValues(rollbackContext);
}

function getRollbackContext(
  currentPreferences: NotificationPreferences | undefined,
  context: PreferencesMutationContext | undefined,
) {
  const previousPreferences = context?.previousPreferences;

  if (!currentPreferences || !context || !previousPreferences) {
    return null;
  }

  return {
    context,
    currentPreferences,
    previousPreferences,
  };
}

function getRollbackPreferencesFallback(
  currentPreferences: NotificationPreferences | undefined,
  context: PreferencesMutationContext | undefined,
) {
  return context?.previousPreferences ?? currentPreferences;
}

function restoreChangedPreferenceValues({
  context,
  currentPreferences,
  previousPreferences,
}: {
  context: PreferencesMutationContext;
  currentPreferences: NotificationPreferences;
  previousPreferences: NotificationPreferences;
}) {
  const nextPreferences: NotificationPreferences = { ...currentPreferences };

  for (const key of context.changedKeys) {
    restorePreviousPreferenceValueIfOptimistic(
      nextPreferences,
      context,
      previousPreferences,
      key,
    );
  }

  return nextPreferences;
}

function restorePreviousPreferenceValueIfOptimistic(
  nextPreferences: NotificationPreferences,
  context: PreferencesMutationContext,
  previousPreferences: NotificationPreferences,
  key: SettingsPreferenceKey,
) {
  if (!isOptimisticPreferenceValue(nextPreferences, context, key)) {
    return;
  }

  restorePreviousPreferenceValue(nextPreferences, previousPreferences, key);
}

function isOptimisticPreferenceValue(
  currentPreferences: NotificationPreferences,
  context: PreferencesMutationContext,
  key: SettingsPreferenceKey,
) {
  return currentPreferences[key] === context.optimisticPreferences[key];
}

function restorePreviousPreferenceValue(
  nextPreferences: NotificationPreferences,
  previousPreferences: NotificationPreferences,
  key: SettingsPreferenceKey,
) {
  Object.assign(nextPreferences, {
    [key]: previousPreferences[key],
  });
}

function getSavingPreferenceKeysWithChanges(
  currentKeys: ReadonlySet<SettingsPreferenceKey>,
  changedKeys: readonly SettingsPreferenceKey[],
  shouldTrack: boolean,
) {
  const nextKeys = new Set(currentKeys);

  for (const key of changedKeys) {
    if (shouldTrack) {
      nextKeys.add(key);
      continue;
    }

    nextKeys.delete(key);
  }

  return nextKeys;
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
    ...SettingsQueryFactory.notificationPreferences(),
    enabled,
  });

  const preferencesMutation = useMutation<
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

  async function updateMatchingPreference(
    values: Pick<
      NotificationPreferences,
      "autoMatchingEnabled" | "minCompatibilityScore"
    >,
  ) {
    await saveNotificationPreferencePatch(values);
  }

  async function updatePrivacyPreference(
    values: Pick<
      NotificationPreferences,
      | "showAgeOnProfile"
      | "showGenderOnProfile"
      | "showCityOnProfile"
      | "showFriendsListOnProfile"
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
    updateMatchingPreference,
    updatePrivacyPreference,
    updateAppearancePreference,
    isSavingNotificationPreferences: preferencesMutation.isPending,
    savingNotificationPreferenceKeys: savingPreferenceKeys,
    isOnline,
  };
}
