import type { ElementType } from "react";

export interface PinnedEntry {
  id: string;
  label: string;
  body: string;
  accentClass: string;
  colorClass: string;
  icon: ElementType;
  isPlan: boolean;
  messageId?: string;
}
