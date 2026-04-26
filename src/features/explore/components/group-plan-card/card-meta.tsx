import { CalendarClock, Gift, Laptop, Route, Ticket } from "lucide-react";

import type { Plan } from "@/shared/schemas";

interface CardMetaProps {
  plan?: Plan;
  distance?: string;
}

export function CardMeta({ plan, distance }: CardMetaProps) {
  const dateStr = plan?.dateTime || "";
  const locationMode = plan?.locationMode || "TBD";
  const cost = plan?.cost || "FREE";

  const formattedDate = dateStr
    ? new Date(dateStr)
        .toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/,/g, " •")
    : "Date TBD";

  const isOnline = locationMode === "ONLINE";
  const isFree = cost === "FREE";

  return (
    <div className="flex flex-col gap-3 mb-4 relative z-10">
      <div className="flex items-center gap-3 text-sm text-foreground/80 group-hover:text-foreground transition-colors">
        <CalendarClock
          className="w-4 h-4 text-primary shrink-0"
          strokeWidth={2.5}
        />
        <span className="font-semibold">{formattedDate}</span>
      </div>

      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
        {/* Distance / Online */}
        <div className="flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
          {isOnline ? (
            <Laptop className="w-4 h-4 shrink-0" strokeWidth={2} />
          ) : (
            <Route className="w-4 h-4 shrink-0" strokeWidth={2} />
          )}
          <span className="truncate">
            {isOnline ? "Online Stream" : distance || "Nearby"}
          </span>
        </div>
        <div className="w-1 h-1 rounded-full bg-border" /> {/* Separator */}
        {/* Cost Indicator */}
        <div className="flex items-center gap-1.5 group-hover:text-foreground/80 transition-colors">
          {isFree ? (
            <>
              <Gift
                className="w-4 h-4 text-forge-teal shrink-0"
                strokeWidth={2}
              />
              <span className="font-medium text-foreground">Free</span>
            </>
          ) : (
            <>
              <Ticket className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span className="font-medium text-foreground/80">Paid</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
