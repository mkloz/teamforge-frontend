import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface ProfileBadgeModel {
  bgClass: string;
  colorClass: string;
  description: string;
  icon: LucideIcon;
  iconBgClass: string;
  id: string;
  label: string;
  renderIconWrapper?: (children: ReactNode) => ReactNode;
  value: string | number;
}
