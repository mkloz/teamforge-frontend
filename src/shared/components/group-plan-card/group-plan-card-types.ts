import type { ReactNode } from "react";
import type { ExploreGroup } from "@/shared/schemas";

export type GroupPlanCardVariant = "default" | "compact";

export interface GroupPlanCardProps {
  group: ExploreGroup;
  action: ReactNode;
  variant?: GroupPlanCardVariant;
}
