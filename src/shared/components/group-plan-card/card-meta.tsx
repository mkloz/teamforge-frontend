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
    <div className="flex flex-col gap-3 mb-4 relative z-10">
      <div className="flex items-center gap-3 text-sm text-foreground/80 group-hover:text-foreground transition-colors">
        <CalendarClock
          className="w-4 h-4 text-primary shrink-0"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <span className="font-semibold">{formattedDate}</span>
      </div>

      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
          {isOnline ? (
            <Laptop className="w-4 h-4 shrink-0" strokeWidth={2} />
          ) : (
            <Route className="w-4 h-4 shrink-0" strokeWidth={2} />
          )}
          <span className="truncate">{locationLabel}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-center gap-1.5 group-hover:text-foreground/80 transition-colors">
          {isFree ? (
            <>
              <Gift
                className="w-4 h-4 text-forge-teal shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="font-medium text-foreground">Free</span>
            </>
          ) : (
            <>
              <Ticket
                className="w-4 h-4 shrink-0"
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
