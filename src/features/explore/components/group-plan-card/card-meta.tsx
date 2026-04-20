import { CalendarClock, Gift, Laptop, Route, Ticket } from "lucide-react";

interface CardMetaProps {
  date: string;
  distance: string | undefined;
  locationMode?: string;
  cost: string;
}

export function CardMeta({
  date,
  distance,
  locationMode,
  cost,
}: CardMetaProps) {
  return (
    <div className="flex flex-col gap-3 mb-4 relative z-10">
      <div className="flex items-center gap-3 text-sm text-foreground/80 group-hover:text-foreground transition-colors">
        <CalendarClock
          className="w-4 h-4 text-primary shrink-0"
          strokeWidth={2.5}
        />
        <span className="font-semibold">{date}</span>
      </div>

      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
        {/* Distance / Online */}
        <div className="flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
          {locationMode === "Online" ? (
            <Laptop className="w-4 h-4 shrink-0" strokeWidth={2} />
          ) : (
            <Route className="w-4 h-4 shrink-0" strokeWidth={2} />
          )}
          <span className="truncate">
            {locationMode === "Online" ? "Online Stream" : distance}
          </span>
        </div>
        <div className="w-1 h-1 rounded-full bg-border" /> {/* Separator */}
        {/* Cost Indicator */}
        <div className="flex items-center gap-1.5 group-hover:text-foreground/80 transition-colors">
          {cost === "Free" ? (
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
