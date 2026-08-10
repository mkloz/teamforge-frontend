import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import {
  ACTIVITIES,
  type ActivityOption,
} from "@/features/plan-creation/constants/plan-creation.constants";
import { CATEGORY_TEMPLATES } from "@/features/plan-creation/data/plan-template-seeds";
import { buildCategoryFitHighlights } from "@/features/plan-creation/lib/plan-template-suggestions";
import { resolveTemplateCoverPreviewImage } from "@/features/plan-creation/lib/plan-template-suggestions/cover-images";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { PlanCover } from "@/shared/components/common/plan-cover";
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
      <span className="block">{lead}</span>
      <span className="block whitespace-nowrap">&amp; {tail}</span>
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
    <section
      aria-labelledby="activity-category-heading"
      className="flex flex-col gap-2.5"
    >
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3
            id="activity-category-heading"
            className="font-semibold text-muted-foreground text-xs leading-none"
          >
            Choose a category
          </h3>
        </div>
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
    </section>
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
  const LeadingIcon = tileState.selected ? Check : Icon;
  const coverImage = getActivityCategoryCoverImage(activity.id);

  return (
    <button
      type="button"
      onClick={() => onSelect(tileState.nextSelectedActivity)}
      aria-pressed={tileState.selected}
      className={getActivityButtonClassName(tileState)}
    >
      {coverImage ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-3/5 overflow-hidden">
          <PlanCover
            value={coverImage}
            alt=""
            className="size-full"
            imageClassName="size-full object-cover opacity-24 grayscale transition-[opacity,transform] duration-300 group-hover:scale-[1.025] group-hover:opacity-34"
          />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-30% from-card via-65% via-card/90 to-card/35" />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-colors",
          tileState.selected
            ? "bg-accent-soft"
            : tileState.personalised
              ? "bg-primary-soft"
              : "bg-transparent",
        )}
      />

      <div className="relative z-10 flex min-w-0 items-center gap-2">
        <IconTile
          icon={LeadingIcon}
          size="sm"
          tone={tileState.iconTone}
          className={getActivityIconTileClassName(tileState)}
        />
        <p className={getActivityLabelClassName(tileState.selected)}>
          <ActivityLabel label={activity.label} />
        </p>
      </div>

      <p className="relative z-10 line-clamp-2 min-w-0 text-wrap text-muted-foreground text-xs leading-snug">
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
    "group relative flex min-h-20 min-w-0 flex-col gap-2 overflow-hidden whitespace-normal rounded-lg border px-3 py-2.5 text-left transition-[border-color,box-shadow,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 motion-reduce:transition-none",
    selected
      ? "border-brand-amber/65 bg-accent-soft shadow-sm ring-1 ring-brand-amber/20"
      : personalised
        ? "border-foreground/15 bg-primary-soft hover:border-foreground/40 hover:shadow-soft-sm"
        : "border-border/40 bg-card/80 hover:border-foreground/35 hover:shadow-soft-sm",
  );
}

function getActivityIconTileClassName({
  personalised,
  selected,
}: ReturnType<typeof getActivityCategoryTileState>) {
  return cn(
    selected && "bg-brand-amber/15 shadow-none ring-0",
    personalised && "group-hover:-translate-y-0.5 group-hover:shadow-soft-sm",
    !selected &&
      !personalised &&
      "bg-muted group-hover:-translate-y-0.5 group-hover:bg-card group-hover:text-foreground group-hover:shadow-soft-sm",
  );
}

function getActivityLabelClassName(selected: boolean) {
  return cn(
    "min-w-0 text-pretty font-semibold text-xs leading-tight",
    selected ? "text-brand-amber" : "text-foreground",
  );
}

function getActivityCategoryCoverImage(
  categoryId: ActivityOption["id"],
): string | null {
  const templates = CATEGORY_TEMPLATES[categoryId] ?? [];
  const preferredTemplateId = CATEGORY_COVER_TEMPLATE_IDS[categoryId];
  const seed =
    templates.find((template) => template.id === preferredTemplateId) ??
    templates[0];

  return seed ? resolveTemplateCoverPreviewImage(seed) : null;
}

const CATEGORY_COVER_TEMPLATE_IDS = {
  SPORTS: "pickup",
  GAMING: "party",
  SOCIAL: "coffee",
  ARTS: "gallery",
  MUSIC: "gig",
  OUTDOORS: "walk",
  LEARNING: "study",
  FOOD: "brunch",
  TECH: "build",
  WELLNESS: "reset",
  TRAVEL: "mini-adventure",
  OTHER: "project",
} satisfies Record<ActivityOption["id"], string>;
