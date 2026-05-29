import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, RotateCcw, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import type { PlanHistoryItem } from "@/features/activity/lib/activity-contract";
import { buildActivityGroupNavigation } from "@/features/activity/lib/activity-route";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  categoryColors,
  formatPanelToken,
  statusColors,
} from "../lib/constants";

interface HistoryCardProps {
  groupId: string;
  isFocused?: boolean;
  isUseAsTemplateDisabled?: boolean;
  isUseAsTemplateLoading?: boolean;
  item: PlanHistoryItem;
  onUseAsTemplate?: () => void;
}

export function HistoryCard({
  groupId,
  isFocused = false,
  isUseAsTemplateDisabled = false,
  isUseAsTemplateLoading = false,
  item,
  onUseAsTemplate,
}: HistoryCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const statusLabel = formatPanelToken(item.status);
  const dateLabel = item.dateTime
    ? new Date(item.dateTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "TBD";

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [isFocused]);

  return (
    <article
      ref={cardRef}
      className={cn(
        "group main-action-grid grid items-start gap-x-2 py-3 transition-all duration-300",
        isFocused &&
          "rounded-xl bg-forge-teal/8 px-3 ring-1 ring-forge-teal/20",
      )}
    >
      <Link
        {...buildActivityGroupNavigation(groupId, {
          panel: "group",
          plan: item.id,
        })}
        aria-label={`Open previous plan ${item.title}`}
        aria-current={isFocused ? "location" : undefined}
        className="min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg shadow-xs">
            <PlanCover
              value={item.coverImage}
              alt={item.title}
              imageClassName="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-ink/5 transition-colors group-hover:bg-transparent" />
          </div>

          <div className="min-w-0 flex-1 self-center">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <h4 className="truncate font-semibold text-ink text-sm transition-colors group-hover:text-forge-teal">
                {item.title}
              </h4>
              {item.rating ? (
                <div className="flex shrink-0 items-center gap-1 rounded-md bg-spark-amber/10 px-1.5 py-0.5">
                  <Star className="size-3 fill-spark-amber text-spark-amber" />
                  <span className="font-bold text-spark-amber text-xs">
                    {item.rating}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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
            </div>
          </div>
        </div>

        <div className="mt-2 flex min-w-0 items-center gap-3 pl-16">
          <span className="flex items-center gap-1 font-bold text-muted-foreground text-xs opacity-75">
            <Calendar className="size-3 shrink-0" />
            {dateLabel}
          </span>

          {item.location ? (
            <span className="flex min-w-0 flex-1 items-center gap-1 font-medium text-slate-muted text-xs">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{item.location}</span>
            </span>
          ) : null}
        </div>
      </Link>

      {onUseAsTemplate ? (
        <Button
          type="button"
          variant="secondary"
          size="xs"
          className="mt-1 shrink-0 px-2.5"
          contentClassName="gap-1.5"
          disabled={isUseAsTemplateDisabled}
          loading={isUseAsTemplateLoading}
          onClick={(event) => {
            event.stopPropagation();
            onUseAsTemplate();
          }}
          aria-label={`Use ${item.title} as a template for a new plan`}
        >
          <RotateCcw className="size-3.5 shrink-0" />
          <span>Retry</span>
        </Button>
      ) : null}
    </article>
  );
}
