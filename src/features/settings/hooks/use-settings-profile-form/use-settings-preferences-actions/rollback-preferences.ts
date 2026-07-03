import type { SettingsPreferenceKey } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/preference-keys";
import type { PreferencesMutationContext } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/preferences-mutation-context";
import type { NotificationPreferences } from "@/shared/schemas";

export function rollbackChangedPreferenceKeys(
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
