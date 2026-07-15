import { Brush, Frame, Layers2, PenLine } from "lucide-react";

import { ThemeStyle } from "@/shared/constants/theme-preferences";

export const STYLE_OPTIONS = [
  {
    value: ThemeStyle.CLASSIC,
    label: "Classic",
    description: "Standard cards and panels.",
    icon: Layers2,
  },
  {
    value: ThemeStyle.GLASS,
    label: "Glass",
    description: "Soft translucent panels.",
    icon: Brush,
  },
  {
    value: ThemeStyle.INK,
    label: "Ink",
    description: "Denser, tighter surfaces.",
    icon: PenLine,
  },
  {
    value: ThemeStyle.POSTER,
    label: "Poster",
    description: "Bolder graphic borders.",
    icon: Frame,
  },
] as const;
