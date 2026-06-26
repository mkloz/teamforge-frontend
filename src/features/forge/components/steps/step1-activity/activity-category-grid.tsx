import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import {
  ACTIVITIES,
  type ActivityOption,
} from "@/features/forge/constants/forge.constants";
import { buildCategoryFitHighlights } from "@/features/forge/lib/forge-template-suggestions";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";
import { ICON_MAP } from "./activity-icon-map";

interface ActivityCategoryGridProps {
  selectedActivity: string | null;
  shaking: boolean;
  onSelect: (activity: string | null) => void;
}

interface ActivityCategoryButtonProps {
  activity: ActivityOption;
  fitRankByCategory: ReadonlyMap<string, number>;
  onSelect: (activity: string | null) => void;
  selectedActivity: string | null;
}

function ActivityLabel({ label }: { label: string }) {
  const [lead, tail] = label.split(" & ");

  if (!tail) {
    return label;
  }

  return (
    <>
      {lead} <span className="whitespace-nowrap">&amp; {tail}</span>
    </>
  );
}

export function ActivityCategoryGrid({
  selectedActivity,
  shaking,
  onSelect,
}: ActivityCategoryGridProps) {
  const { data: currentUser } = useQuery(currentUserQueryOptions());
  const fitHighlights = buildCategoryFitHighlights(currentUser);
  const fitRankByCategory = buildFitRankByCategory(fitHighlights);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <p className="font-semibold text-muted-foreground text-xs leading-none">
            Choose a category
          </p>
          <p className="mt-1 text-micro text-muted-foreground/55 leading-none">
            Pick a style and we&apos;ll find the right people.
          </p>
        </div>
        <p className="shrink-0 font-semibold text-micro text-muted-foreground/50 leading-none">
          {ACTIVITIES.length} options
        </p>
      </div>

      <div
        className={cn(
          "grid grid-cols-2 gap-2 transition-transform sm:grid-cols-3 lg:grid-cols-4",
          shaking && "animate-pulse",
        )}
      >
        {ACTIVITIES.map((activity) => (
          <ActivityCategoryButton
            key={activity.id}
            activity={activity}
            fitRankByCategory={fitRankByCategory}
            onSelect={onSelect}
            selectedActivity={selectedActivity}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityCategoryButton({
  activity,
  fitRankByCategory,
  onSelect,
  selectedActivity,
}: ActivityCategoryButtonProps) {
  const tileState = getActivityCategoryTileState(
    activity,
    selectedActivity,
    fitRankByCategory,
  );
  const Icon = ICON_MAP[activity.id] || ICON_MAP.fallback;

  return (
    <button
      type="button"
      onClick={() => onSelect(tileState.nextSelectedActivity)}
      aria-pressed={tileState.selected}
      className={getActivityButtonClassName(tileState)}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <IconTile
            icon={Icon}
            size="sm"
            tone={tileState.iconTone}
            className={getActivityIconTileClassName(tileState)}
          />
          <p
            className={getActivityLabelClassName(
              activity.label,
              tileState.selected,
            )}
          >
            <ActivityLabel label={activity.label} />
          </p>
        </div>

        {tileState.selected && (
          <IconTile
            bordered
            icon={Check}
            shape="circle"
            size="xs"
            tone="amber"
            className="bg-spark-amber/15"
          />
        )}
      </div>

      <p className="line-clamp-2 min-w-0 text-wrap text-muted-foreground text-xs leading-snug">
        {activity.description}
      </p>
    </button>
  );
}

function buildFitRankByCategory(
  fitHighlights: ReturnType<typeof buildCategoryFitHighlights>,
) {
  return new Map(
    fitHighlights.map((fit, index) => [fit.categoryId, index + 1]),
  );
}

function getActivityCategoryTileState(
  activity: ActivityOption,
  selectedActivity: string | null,
  fitRankByCategory: ReadonlyMap<string, number>,
) {
  const selected = selectedActivity === activity.label;
  const personalised = fitRankByCategory.has(activity.id);

  return {
    selected,
    personalised,
    iconTone: selected ? "amber" : personalised ? "teal" : "neutral",
    nextSelectedActivity: selected ? null : activity.label,
  } as const;
}

function getActivityButtonClassName({
  personalised,
  selected,
}: ReturnType<typeof getActivityCategoryTileState>) {
  return cn(
    "group relative flex min-h-20 min-w-0 flex-col gap-2 whitespace-normal rounded-lg border px-3 py-2.5 text-left transition duration-200 active:scale-95",
    selected
      ? "border-spark-amber/65 bg-spark-amber/10 shadow-sm ring-1 ring-spark-amber/20"
      : personalised
        ? "border-forge-teal/35 bg-forge-teal/5 hover:border-forge-teal/50 hover:bg-forge-teal/10"
        : "border-border/40 bg-card/80 hover:border-forge-teal/30 hover:bg-forge-teal/5",
  );
}

function getActivityIconTileClassName({
  personalised,
  selected,
}: ReturnType<typeof getActivityCategoryTileState>) {
  return cn(
    selected && "shadow-sm ring-1 ring-spark-amber/20",
    personalised && "group-hover:bg-forge-teal/15",
    !selected &&
      !personalised &&
      "bg-muted group-hover:bg-forge-teal/10 group-hover:text-forge-teal",
  );
}

function getActivityLabelClassName(label: string, selected: boolean) {
  return cn(
    "min-w-0 text-pretty font-semibold leading-tight",
    label.length > 18 ? "text-xs" : label.length > 13 ? "text-sm" : "text-sm",
    selected ? "text-spark-amber" : "text-foreground",
  );
}
