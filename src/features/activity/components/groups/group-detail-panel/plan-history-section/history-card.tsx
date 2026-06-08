import { RotateCcw, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import type { PlanHistoryItem } from "@/features/activity/lib/activity-contract";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import {
  categoryColors,
  formatPanelToken,
  statusColors,
} from "../lib/constants";
import { HistoryDetailPanel } from "./history-detail-panel";

interface HistoryCardProps {
  isExpanded?: boolean;
  isUseAsTemplateDisabled?: boolean;
  isUseAsTemplateLoading?: boolean;
  item: PlanHistoryItem;
  onToggle: () => void;
  onUseAsTemplate?: () => void;
}

export function HistoryCard({
  isExpanded = false,
  isUseAsTemplateDisabled = false,
  isUseAsTemplateLoading = false,
  item,
  onToggle,
  onUseAsTemplate,
}: HistoryCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const statusLabel = formatPanelToken(item.status);
  const detailPanelId = `plan-history-detail-${item.id}`;

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [isExpanded]);

  return (
    <article
      ref={cardRef}
      className={cn(
        "group main-action-grid grid items-start gap-x-2 py-3 transition-all duration-300",
        isExpanded &&
          "rounded-xl bg-forge-teal/8 px-3 ring-1 ring-forge-teal/20",
      )}
    >
      <button
        type="button"
        aria-controls={detailPanelId}
        aria-expanded={isExpanded}
        className="min-w-0 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onToggle}
      >
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg shadow-xs">
            <PlanCover
              value={item.coverImage}
              media={item.coverImageMedia ?? null}
              alt={item.title}
              imageClassName="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-ink/5 transition-colors group-hover:bg-transparent" />
          </div>

          <div className="min-w-0 flex-1 self-center pr-1">
            <div className="flex min-w-0 items-start gap-2">
              <h4 className="truncate font-semibold text-ink text-sm transition-colors group-hover:text-forge-teal">
                {item.title}
              </h4>
              {item.rating ? (
                <StatusPill
                  icon={Star}
                  iconClassName="size-3 fill-spark-amber"
                  tone="none"
                  className="rounded-md border-0 bg-spark-amber/10 px-1.5 text-spark-amber text-xs"
                >
                  {item.rating}
                </StatusPill>
              ) : null}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <StatusPill tone="none" className={categoryColors[item.category]}>
                {formatPanelToken(item.category)}
              </StatusPill>
              <StatusPill tone="none" className={statusColors[item.status]}>
                {statusLabel}
              </StatusPill>
            </div>
          </div>
        </div>
      </button>

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

      {isExpanded ? (
        <HistoryDetailPanel id={detailPanelId} item={item} />
      ) : null}
    </article>
  );
}
