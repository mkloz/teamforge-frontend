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
          "rounded-xl bg-primary-soft px-3 ring-1 ring-brand-teal/20",
      )}
    >
      <HistoryCardSummaryButton
        detailPanelId={detailPanelId}
        isExpanded={isExpanded}
        item={item}
        statusLabel={statusLabel}
        onToggle={onToggle}
      />

      <HistoryTemplateButton
        isDisabled={isUseAsTemplateDisabled}
        isLoading={isUseAsTemplateLoading}
        item={item}
        onUseAsTemplate={onUseAsTemplate}
      />

      <HistoryDetailPanelSlot
        detailPanelId={detailPanelId}
        isExpanded={isExpanded}
        item={item}
      />
    </article>
  );
}

function HistoryCardSummaryButton({
  detailPanelId,
  isExpanded,
  item,
  onToggle,
  statusLabel,
}: {
  detailPanelId: string;
  isExpanded: boolean;
  item: PlanHistoryItem;
  onToggle: () => void;
  statusLabel: string;
}) {
  return (
    <button
      type="button"
      aria-controls={detailPanelId}
      aria-expanded={isExpanded}
      className="min-w-0 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onToggle}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <HistoryCardCover item={item} />

        <div className="min-w-0 flex-1 self-center pr-1">
          <HistoryCardTitleRow item={item} />

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
  );
}

function HistoryCardCover({ item }: { item: PlanHistoryItem }) {
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg shadow-xs">
      <PlanCover
        value={item.coverImage}
        media={item.coverImageMedia ?? null}
        alt={item.title}
        imageClassName="transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-ink/5 transition-colors group-hover:bg-transparent" />
    </div>
  );
}

function HistoryCardTitleRow({ item }: { item: PlanHistoryItem }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <h4 className="truncate font-semibold text-ink text-sm transition-colors group-hover:text-foreground">
        {item.title}
      </h4>
      <HistoryRatingPill rating={item.rating} />
    </div>
  );
}

function HistoryRatingPill({ rating }: { rating: PlanHistoryItem["rating"] }) {
  if (!rating) {
    return null;
  }

  return (
    <StatusPill
      icon={Star}
      iconClassName="size-3 fill-brand-amber"
      tone="none"
      className="rounded-md border-0 bg-accent-soft px-1.5 text-brand-amber text-xs"
    >
      {rating}
    </StatusPill>
  );
}

function HistoryTemplateButton({
  isDisabled,
  isLoading,
  item,
  onUseAsTemplate,
}: {
  isDisabled: boolean;
  isLoading: boolean;
  item: PlanHistoryItem;
  onUseAsTemplate?: () => void;
}) {
  if (!onUseAsTemplate) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="xs"
      className="mt-1 shrink-0 px-2.5"
      contentClassName="gap-1.5"
      disabled={isDisabled}
      loading={isLoading}
      onClick={(event) => {
        event.stopPropagation();
        onUseAsTemplate();
      }}
      aria-label={`Use ${item.title} as a template for a new plan`}
    >
      <RotateCcw className="size-3.5 shrink-0" />
      <span>Retry</span>
    </Button>
  );
}

function HistoryDetailPanelSlot({
  detailPanelId,
  isExpanded,
  item,
}: {
  detailPanelId: string;
  isExpanded: boolean;
  item: PlanHistoryItem;
}) {
  return isExpanded ? (
    <HistoryDetailPanel id={detailPanelId} item={item} />
  ) : null;
}
