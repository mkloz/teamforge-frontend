import type { LucideIcon } from "lucide-react";

import type { SettingsSection } from "@/shared/navigation/settings-navigation";

export interface SettingsSectionMeta {
  id: SettingsSection;
  label: string;
  headline: string;
  icon: LucideIcon;
}
