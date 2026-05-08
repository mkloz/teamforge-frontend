import { Calendar, MapPin, RotateCcw, Star } from "lucide-react";
import type { PlanHistoryItem } from "@/features/activity/lib/activity-contract";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { categoryColors } from "../lib/constants";

interface HistoryCardProps {
  item: PlanHistoryItem;
}

export function HistoryCard({ item }: HistoryCardProps) {
  return (
    <div className="group flex gap-3.5 rounded-xl border border-transparent bg-muted/20 p-2 transition-all duration-300 hover:border-border/50 hover:bg-muted/40">
      {/* Thumbnail with hover zoom */}
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg shadow-xs">
        <PlanCover
          value={item.coverImage}
          alt={item.title}
          imageClassName="transition-[scale,transform] duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-transparent" />
      </div>

      {/* Content Section */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate font-semibold text-foreground text-sm transition-colors group-hover:text-primary">
            {item.title}
          </h4>
          {item.rating && (
            <div className="flex shrink-0 items-center gap-1 rounded-md bg-spark-amber/10 px-1.5 py-0.5">
              <Star className="size-3 fill-spark-amber text-spark-amber" />
              <span className="font-bold text-spark-amber text-xs">
                {item.rating}
              </span>
            </div>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 font-bold text-xs uppercase tracking-wider",
              categoryColors[item.category],
            )}
          >
            {item.category}
          </span>
          <span className="flex items-center gap-1 font-bold text-muted-foreground text-xs uppercase opacity-50">
            <Calendar className="size-3" />
            {item.dateTime
              ? new Date(item.dateTime).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "TBD"}
          </span>
        </div>

        {/* Location - Responsive display */}
        <p className="mt-0.5 flex items-center gap-1 truncate font-medium text-muted-foreground text-xs opacity-40">
          <MapPin className="size-3" />
          {item.location}
        </p>
      </div>

      {/* Action button - Primary interaction */}
      <div className="flex items-center pr-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 shrink-0 translate-x-1 rounded-lg opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
          title="Create similar plan"
        >
          <RotateCcw className="size-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
