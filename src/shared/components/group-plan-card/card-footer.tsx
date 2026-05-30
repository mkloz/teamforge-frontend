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
        "pointer-events-none relative z-40 mt-auto flex min-w-0 items-center justify-between pt-3",
        isCompact ? "gap-2" : "flex-wrap gap-3",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 items-center",
          isCompact ? "gap-2" : "gap-2.5",
        )}
      >
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

      <div className="pointer-events-auto ml-auto shrink-0">{action}</div>
    </div>
  );
}
