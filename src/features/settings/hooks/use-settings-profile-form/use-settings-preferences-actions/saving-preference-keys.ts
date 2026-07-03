import type { SettingsPreferenceKey } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/preference-keys";

export type { SettingsPreferenceKey } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/preference-keys";

export function getSavingPreferenceKeysWithChanges(
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
