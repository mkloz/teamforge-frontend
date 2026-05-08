import type { ReactNode } from "react";

import { CardCapacitySummary } from "@/shared/components/group-plan-card/card-capacity-summary";
import { CardMemberStack } from "@/shared/components/group-plan-card/card-member-stack";
import { getGroupPlanCapacityModel } from "@/shared/components/group-plan-card/group-plan-card-model";
import type { GroupPlanCardVariant } from "@/shared/components/group-plan-card/group-plan-card-types";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";

interface CardFooterProps {
  group: ExploreGroup;
  fallbackInitial: string;
  isFull: boolean;
  action: ReactNode;
  variant?: GroupPlanCardVariant;
}

export function CardFooter({
  group,
  fallbackInitial,
  isFull,
  action,
  variant = "default",
}: CardFooterProps) {
  const isCompact = variant === "compact";
  const { capacity, currentSize, spotsLeft } = getGroupPlanCapacityModel(group);

  return (
    <div
      className={cn(
        "relative z-20 mt-auto flex min-w-0 flex-wrap items-center justify-between gap-3",
        isCompact ? "pt-3" : "pt-3",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <CardMemberStack
          group={group}
          fallbackInitial={fallbackInitial}
          variant={variant}
        />
        <CardCapacitySummary
          capacity={capacity}
          currentSize={currentSize}
          isFull={isFull}
          spotsLeft={spotsLeft}
          variant={variant}
        />
      </div>

      <div className="shrink-0">{action}</div>
    </div>
  );
}
