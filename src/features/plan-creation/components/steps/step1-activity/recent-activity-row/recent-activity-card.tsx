import { Check } from "lucide-react";

import { getRecentActivityTemplateId } from "@/features/plan-creation/lib/recent-activity/recent-activity-template-id";
import { PlanCover } from "@/shared/components/common/plan-cover";
import dayjs from "@/shared/lib/dayjs";
import { cn } from "@/shared/lib/utils";

import { ICON_MAP } from "../activity-icon-map";
import type { RecentActivityCardProps } from "./types";

type RecentActivityCardViewState = ReturnType<
  typeof getRecentActivityCardViewState
>;

function getUsageLabel(count: number) {
  if (count === 1) {
    return "Used once";
  }

  if (count === 2) {
    return "Used twice";
  }

  return `Used ${count} times`;
}

export function RecentActivityCard({
  activity,
  active,
  onTemplateToggle,
}: RecentActivityCardProps) {
  const viewState = getRecentActivityCardViewState(activity);

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onTemplateToggle(viewState.templateId, activity.template)}
      className={getCardClassName(active)}
    >
      <RecentActivityMedia viewState={viewState} />
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
        <RecentActivityCopy activity={activity} viewState={viewState} />
        {active ? (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-teal text-white">
            <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
    </button>
  );
}

function getRecentActivityCardViewState(
  activity: RecentActivityCardProps["activity"],
) {
  const Icon = ICON_MAP[activity.categoryId] || ICON_MAP.fallback;

  return {
    Icon,
    hasCoverImage: Boolean(activity.template.coverImage),
    lastUsedLabel: dayjs(activity.lastUsedAt).fromNow(),
    templateCoverImage: activity.template.coverImage,
    templateId: getRecentActivityTemplateId(activity.id),
    usageLabel: getUsageLabel(activity.count),
  };
}

function getCardClassName(active: boolean) {
  return cn(
    "group flex h-16 w-full min-w-0 overflow-hidden rounded-xl border bg-card/70 text-left transition-[background-color,border-color,box-shadow,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] motion-reduce:transition-none",
    active
      ? "border-brand-teal bg-primary-soft ring-1 ring-brand-teal/20"
      : "border-border/45 hover:border-foreground/35 hover:shadow-soft-sm",
  );
}

function RecentActivityMedia({
  viewState,
}: {
  viewState: RecentActivityCardViewState;
}) {
  const FallbackIcon = viewState.Icon;

  return (
    <div className="relative flex h-full w-16 shrink-0 items-center justify-center overflow-hidden bg-muted">
      {viewState.hasCoverImage ? (
        <PlanCover
          value={viewState.templateCoverImage}
          alt=""
          className="absolute inset-0 size-full"
          imageClassName="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <FallbackIcon
          aria-hidden="true"
          className="size-9 text-muted-foreground/70 transition-colors group-hover:text-foreground"
          strokeWidth={1.5}
        />
      )}
    </div>
  );
}

function RecentActivityCopy({
  activity,
  viewState,
}: {
  activity: RecentActivityCardProps["activity"];
  viewState: RecentActivityCardViewState;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold text-foreground text-sm leading-tight">
        {activity.title}
      </p>
      <p className="mt-1.5 truncate font-medium text-muted-foreground text-xs leading-none">
        {viewState.usageLabel} · {viewState.lastUsedLabel}
      </p>
    </div>
  );
}
