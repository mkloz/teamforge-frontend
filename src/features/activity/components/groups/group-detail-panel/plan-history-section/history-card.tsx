import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Star } from "lucide-react";
import type { PlanHistoryItem } from "@/features/activity/lib/activity-contract";
import { buildActivityGroupNavigation } from "@/features/activity/lib/activity-route";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { cn } from "@/shared/lib/utils";
import {
  categoryColors,
  formatPanelToken,
  statusColors,
} from "../lib/constants";

interface HistoryCardProps {
  groupId: string;
  item: PlanHistoryItem;
}

export function HistoryCard({ groupId, item }: HistoryCardProps) {
  const statusLabel = formatPanelToken(item.status);

  return (
    <Link
      {...buildActivityGroupNavigation(groupId, {
        panel: "group",
        plan: item.id,
      })}
      aria-label={`Open previous plan ${item.title}`}
      className="group flex gap-3.5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg shadow-xs">
        <PlanCover
          value={item.coverImage}
          alt={item.title}
          imageClassName="transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-ink/5 transition-colors group-hover:bg-transparent" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate font-semibold text-ink text-sm transition-colors group-hover:text-forge-teal">
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

        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-bold text-micro",
              categoryColors[item.category],
            )}
          >
            {formatPanelToken(item.category)}
          </span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-bold text-micro",
              statusColors[item.status],
            )}
          >
            {statusLabel}
          </span>
          <span className="flex items-center gap-1 font-bold text-muted-foreground text-xs opacity-70">
            <Calendar className="size-3" />
            {item.dateTime
              ? new Date(item.dateTime).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "TBD"}
          </span>
        </div>

        {item.location ? (
          <p className="mt-1 flex items-center gap-1 truncate font-medium text-slate-muted text-xs">
            <MapPin className="size-3" />
            {item.location}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
