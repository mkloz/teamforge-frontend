import { Calendar, RotateCcw, Star, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { cn } from "@/shared/lib/utils";
import type { PlanHistoryItem } from "../../../lib/activity-contract";
import { categoryColors } from "./lib/constants";

interface HistoryCardProps {
  item: PlanHistoryItem;
}

export function HistoryCard({ item }: HistoryCardProps) {
  return (
    <div className="flex gap-3.5 p-2 rounded-xl bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/50 transition-all duration-300 group">
      {/* Thumbnail with hover zoom */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-xs">
        <PlanCover
          value={item.coverImage}
          alt={item.title}
          imageClassName="transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {item.title}
          </h4>
          {item.rating && (
            <div className="flex items-center gap-1 shrink-0 bg-amber-500/10 px-1 py-0.5 rounded-md">
              <Star size={8} className="text-amber-500 fill-amber-500" />
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                {item.rating}
              </span>
            </div>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wider",
              categoryColors[item.category],
            )}
          >
            {item.category}
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1 opacity-50">
            <Calendar size={9} />
            {item.dateTime
              ? new Date(item.dateTime).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "TBD"}
          </span>
        </div>

        {/* Location - Responsive display */}
        <p className="text-[9px] font-medium text-muted-foreground mt-0.5 truncate flex items-center gap-1 opacity-40">
          <MapPin size={9} />
          {item.location}
        </p>
      </div>

      {/* Action button - Primary interaction */}
      <div className="flex items-center pr-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0"
          title="Create similar plan"
        >
          <RotateCcw size={12} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
