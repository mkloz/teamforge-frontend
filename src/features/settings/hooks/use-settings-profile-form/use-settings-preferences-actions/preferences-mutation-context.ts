import type { SettingsPreferenceKey } from "@/features/settings/hooks/use-settings-profile-form/use-settings-preferences-actions/preference-keys";
import type { NotificationPreferences } from "@/shared/schemas";

export interface PreferencesMutationContext {
  changedKeys: SettingsPreferenceKey[];
  optimisticPreferences: NotificationPreferences;
  previousPreferences: NotificationPreferences | undefined;
}
