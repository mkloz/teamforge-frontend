import { Monitor, Moon, Sun } from "lucide-react";

import type { SegmentedTabOption } from "@/shared/components/ui/segmented-tabs";
import {
  ThemeAppearance,
  type ThemeAppearance as ThemeAppearanceValue,
} from "@/shared/constants/theme-preferences";

export const APPEARANCE_OPTIONS = [
  {
    id: ThemeAppearance.SYSTEM,
    label: "System",
    shortLabel: "Auto",
    icon: Monitor,
  },
  {
    id: ThemeAppearance.LIGHT,
    label: "Light",
    icon: Sun,
  },
  {
    id: ThemeAppearance.DARK,
    label: "Dark",
    icon: Moon,
  },
] as const satisfies ReadonlyArray<SegmentedTabOption<ThemeAppearanceValue>>;
