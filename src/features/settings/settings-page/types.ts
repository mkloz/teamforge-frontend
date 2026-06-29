import type { LucideIcon } from "lucide-react";

import type { SettingsSection } from "@/shared/navigation/settings-navigation";

export interface SettingsSectionMeta {
  id: SettingsSection;
  label: string;
  description: string;
  headline: string;
  summary: string;
  icon: LucideIcon;
}
