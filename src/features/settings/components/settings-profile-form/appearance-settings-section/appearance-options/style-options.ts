import { Blend, FoldHorizontal, Gauge, ScanText } from "lucide-react";

import { ThemeStyle } from "@/shared/constants/theme-preferences";

export const STYLE_OPTIONS = [
  {
    value: ThemeStyle.CLASSIC,
    label: "Comfortable",
    description: "44px controls, 12px corners, and full motion.",
    icon: Blend,
  },
  {
    value: ThemeStyle.INK,
    label: "Compact",
    description: "40px controls and tighter 8px corners.",
    icon: FoldHorizontal,
  },
  {
    value: ThemeStyle.POSTER,
    label: "High contrast",
    description: "Stronger neutral edges, text, and focus indicators.",
    icon: ScanText,
  },
  {
    value: ThemeStyle.GLASS,
    label: "Reduced effects",
    description: "Removes decorative motion, blur, and elevation.",
    icon: Gauge,
  },
] as const;
