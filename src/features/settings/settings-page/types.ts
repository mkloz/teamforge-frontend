import type { LucideIcon } from "lucide-react";

import type { SettingsSection } from "@/features/settings/lib/settings-route";

export interface SettingsSectionMeta {
  id: SettingsSection;
  label: string;
  description: string;
  headline: string;
  summary: string;
  icon: LucideIcon;
}
