import { CalendarClock, Gift, Laptop, Route, Ticket } from "lucide-react";

import { getGroupPlanMetaModel } from "@/shared/components/group-plan-card/group-plan-card-model";
import type { ExploreGroup } from "@/shared/schemas";

interface CardMetaProps {
  group: ExploreGroup;
  distance?: string;
}

export function CardMeta({ group, distance }: CardMetaProps) {
  const { formattedDate, isFree, isOnline, locationLabel } =
    getGroupPlanMetaModel(group, distance);

  return (
    <div className="relative z-10 mb-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-foreground/80 transition-colors group-hover:text-foreground">
        <CalendarClock
          className="size-4 shrink-0 text-primary"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <span className="font-semibold">{formattedDate}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5 transition-colors group-hover:text-foreground/80">
          {isOnline ? (
            <Laptop className="size-4 shrink-0" strokeWidth={2} />
          ) : (
            <Route className="size-4 shrink-0" strokeWidth={2} />
          )}
          <span className="truncate">{locationLabel}</span>
        </div>
        <div className="size-1 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-center gap-1.5 transition-colors group-hover:text-foreground/80">
          {isFree ? (
            <>
              <Gift
                className="size-4 shrink-0 text-forge-teal"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="font-medium text-foreground">Free</span>
            </>
          ) : (
            <>
              <Ticket
                className="size-4 shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="font-medium text-foreground/80">Paid</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
