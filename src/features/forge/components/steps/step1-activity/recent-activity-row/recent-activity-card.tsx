import { Check } from "lucide-react";

import { PlanCover } from "@/shared/components/common/plan-cover";
import { IconTile } from "@/shared/components/ui/icon-tile";
import dayjs from "@/shared/lib/dayjs";
import { cn } from "@/shared/lib/utils";

import { ICON_MAP } from "../activity-icon-map";
import type { RecentActivityCardProps } from "./types";

type RecentActivityCardViewState = ReturnType<
  typeof getRecentActivityCardViewState
>;
type RecentActivityDisplayTone = "active" | "default" | "recommended";

const RECENT_ACTIVITY_CARD_CLASS_BY_TONE: Record<
  RecentActivityDisplayTone,
  string
> = {
  active: "border-spark-amber/65 bg-spark-amber/10 ring-1 ring-spark-amber/20",
  default:
    "border-border/40 bg-card hover:border-forge-teal/30 hover:bg-forge-teal/5",
  recommended: "border-forge-teal/45 bg-forge-teal/5",
};

const RECENT_ACTIVITY_MEDIA_CLASS_BY_TONE: Record<
  RecentActivityDisplayTone,
  string
> = {
  active: "bg-spark-amber/14",
  default: "bg-muted/80",
  recommended: "bg-forge-teal/10",
};

const RECENT_ACTIVITY_COVER_OVERLAY_CLASS_BY_TONE: Record<
  RecentActivityDisplayTone,
  string
> = {
  active: "bg-spark-amber/24",
  default: "bg-foreground/10 group-hover:bg-foreground/0",
  recommended: "bg-forge-teal/16",
};

const RECENT_ACTIVITY_TITLE_CLASS_BY_TONE: Record<
  RecentActivityDisplayTone,
  string
> = {
  active: "text-spark-amber",
  default: "text-foreground",
  recommended: "text-forge-teal",
};

function getUsageLabel(count: number) {
  return count === 1 ? "1 time" : `${count} times`;
}

export function RecentActivityCard({
  activity,
  active,
  recommended,
  onTemplateToggle,
}: RecentActivityCardProps) {
  const viewState = getRecentActivityCardViewState(activity);
  const displayTone = getRecentActivityDisplayTone({ active, recommended });

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onTemplateToggle(viewState.templateId, activity.template)}
      className={getCardClassName(displayTone)}
    >
      <RecentActivityMedia displayTone={displayTone} viewState={viewState} />

      <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2">
        <RecentActivityCopy
          activity={activity}
          displayTone={displayTone}
          viewState={viewState}
        />

        <RecentActivityActiveIndicator active={displayTone === "active"} />
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
    templateId: `recent:${activity.id}`,
    usageLabel: getUsageLabel(activity.count),
  };
}

function getRecentActivityDisplayTone({
  active,
  recommended,
}: {
  active: boolean;
  recommended: boolean;
}): RecentActivityDisplayTone {
  if (active) {
    return "active";
  }

  return recommended ? "recommended" : "default";
}

function getCardClassName(displayTone: RecentActivityDisplayTone) {
  return cn(
    "group flex h-14 min-w-0 overflow-hidden rounded-lg border bg-card text-left transition-all duration-200 active:scale-95",
    RECENT_ACTIVITY_CARD_CLASS_BY_TONE[displayTone],
  );
}

function getMediaClassName(displayTone: RecentActivityDisplayTone) {
  return cn(
    "relative flex h-full w-14 shrink-0 items-center justify-center overflow-hidden",
    RECENT_ACTIVITY_MEDIA_CLASS_BY_TONE[displayTone],
  );
}

function getCoverOverlayClassName(displayTone: RecentActivityDisplayTone) {
  return cn(
    "absolute inset-0 transition-colors duration-200",
    RECENT_ACTIVITY_COVER_OVERLAY_CLASS_BY_TONE[displayTone],
  );
}

function getIconClassName({
  displayTone,
  hasCoverImage,
}: {
  displayTone: RecentActivityDisplayTone;
  hasCoverImage: boolean;
}) {
  return cn(
    "relative z-10 shadow-sm backdrop-blur",
    getIconToneClassName(displayTone, hasCoverImage),
  );
}

function getIconToneClassName(
  displayTone: RecentActivityDisplayTone,
  hasCoverImage: boolean,
) {
  if (displayTone === "active") {
    return "bg-spark-amber/15 text-spark-amber ring-1 ring-spark-amber/20";
  }

  if (displayTone === "recommended") {
    return "bg-forge-teal text-white";
  }

  return hasCoverImage
    ? "bg-background/90 text-foreground"
    : "bg-background/70 text-muted-foreground group-hover:text-foreground";
}

function getTitleClassName(displayTone: RecentActivityDisplayTone) {
  return cn(
    "truncate font-semibold text-xs leading-tight",
    RECENT_ACTIVITY_TITLE_CLASS_BY_TONE[displayTone],
  );
}

function RecentActivityMedia({
  displayTone,
  viewState,
}: {
  displayTone: RecentActivityDisplayTone;
  viewState: RecentActivityCardViewState;
}) {
  return (
    <div className={getMediaClassName(displayTone)}>
      {viewState.hasCoverImage && (
        <RecentActivityCover displayTone={displayTone} viewState={viewState} />
      )}
      <IconTile
        icon={viewState.Icon}
        shape="circle"
        size="sm"
        tone="none"
        className={getIconClassName({
          displayTone,
          hasCoverImage: viewState.hasCoverImage,
        })}
        iconClassName="size-3"
      />
    </div>
  );
}

function RecentActivityCover({
  displayTone,
  viewState,
}: {
  displayTone: RecentActivityDisplayTone;
  viewState: RecentActivityCardViewState;
}) {
  return (
    <>
      <PlanCover
        value={viewState.templateCoverImage}
        alt=""
        className="absolute inset-0 size-full"
        imageClassName="transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className={getCoverOverlayClassName(displayTone)} />
    </>
  );
}

function RecentActivityCopy({
  activity,
  displayTone,
  viewState,
}: {
  activity: RecentActivityCardProps["activity"];
  displayTone: RecentActivityDisplayTone;
  viewState: RecentActivityCardViewState;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className={getTitleClassName(displayTone)}>{activity.title}</p>
      <p className="mt-1 truncate font-medium text-muted-foreground text-xs leading-none">
        {viewState.usageLabel} - {viewState.lastUsedLabel}
      </p>
    </div>
  );
}

function RecentActivityActiveIndicator({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <IconTile
      bordered
      icon={Check}
      shape="circle"
      size="xs"
      tone="amber"
      className="bg-spark-amber/15"
    />
  );
}
