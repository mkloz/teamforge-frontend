import type { NotificationPreferences } from "@/shared/schemas";

export type BooleanSettingsPreferenceKey = Exclude<
  keyof NotificationPreferences,
  "minCompatibilityScore"
>;
