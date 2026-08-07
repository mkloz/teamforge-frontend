import {
  ArrowUpRight,
  Check,
  type LucideIcon,
  Users,
  Wifi,
} from "lucide-react";

import { PlanCover } from "@/shared/components/common/plan-cover";
import type { CompactBentoSlot } from "@/shared/components/ui/bento-grid";
import { cn } from "@/shared/lib/utils";

import { ICON_MAP } from "../step1-activity/activity-icon-map";
import type { TemplateSuggestionCardProps } from "./types";

type TemplateSuggestion = TemplateSuggestionCardProps["suggestion"];

export function TemplateSuggestionCard({
  active,
  onTemplateSelect,
  slot,
  suggestion,
}: TemplateSuggestionCardProps) {
  const coverImage = getTemplateCoverImage(suggestion);
  const CategoryIcon = ICON_MAP[suggestion.categoryId] ?? ICON_MAP.fallback;
  const presentation = TEMPLATE_TILE_PRESENTATION[slot];
  const isOnline = suggestion.template.locationType === "ONLINE";
  const isProfilePick = suggestion.badge === "Based on your profile";
  const isRecommended = suggestion.badge === "Recommended";

  function handleTemplateSelect() {
    onTemplateSelect(
      suggestion.id,
      getTemplateSelectionPayload(suggestion, coverImage),
    );
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={handleTemplateSelect}
      className={cn(
        "group relative size-full min-w-0 overflow-hidden rounded-2xl border bg-muted text-left transition-[background-color,border-color,box-shadow,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] motion-reduce:transition-none",
        getTemplateBorderClassName({
          active,
          isProfilePick,
          isRecommended,
        }),
      )}
    >
      <PlanCover
        value={coverImage}
        alt=""
        className="absolute inset-0 size-full"
        imageClassName="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        fallbackComponent={<TemplateCoverFallback icon={CategoryIcon} />}
      />
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-black/15 transition-colors group-hover:from-black/95",
          active && "bg-forge-teal/8",
        )}
      />

      {isOnline ? (
        <span className="absolute top-2.5 left-2.5 z-10 flex size-7 items-center justify-center rounded-full bg-black/60 text-white/90 ring-1 ring-white/12 backdrop-blur-sm">
          <Wifi className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Online activity</span>
        </span>
      ) : null}

      {active ? (
        <span className="absolute top-2.5 right-2.5 z-10 flex size-7 items-center justify-center rounded-full bg-forge-teal text-white ring-1 ring-white/20">
          <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
          <span className="sr-only">Selected template</span>
        </span>
      ) : (
        <ArrowUpRight
          className="absolute top-3 right-3 z-10 size-4 text-white/85 drop-shadow transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
          aria-hidden="true"
        />
      )}

      {!active && isProfilePick ? (
        <span className="sr-only">Profile pick</span>
      ) : null}
      {!active && isRecommended ? (
        <span className="sr-only">Recommended template</span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 flex min-w-0 flex-col gap-1.5 p-3 pt-10 sm:p-3.5 sm:pt-12">
        <h4
          className={cn(
            "line-clamp-2 font-bold text-white leading-snug drop-shadow-sm",
            presentation.titleClassName,
          )}
        >
          {suggestion.title}
        </h4>

        {presentation.showDescription ? (
          <p className="line-clamp-2 text-white/78 text-xs leading-relaxed">
            {suggestion.description}
          </p>
        ) : null}

        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-white/75 text-xs">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Users className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {getTemplateGroupSizeText(suggestion.template)}
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}

function getTemplateBorderClassName({
  active,
  isProfilePick,
  isRecommended,
}: {
  active: boolean;
  isProfilePick: boolean;
  isRecommended: boolean;
}) {
  if (active) {
    return "border-2 border-forge-teal ring-2 ring-forge-teal/25";
  }

  if (isProfilePick) {
    return "border-2 border-forge-teal hover:border-forge-teal";
  }

  if (isRecommended) {
    return "border-2 border-spark-amber hover:border-spark-amber";
  }

  return "border-border/35 hover:border-forge-teal/45";
}

function TemplateCoverFallback({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-full items-center justify-center bg-primary/8">
      <Icon className="size-10 text-primary/55" aria-hidden="true" />
    </div>
  );
}

function getTemplateCoverImage(suggestion: TemplateSuggestion) {
  return suggestion.coverImage ?? suggestion.template.coverImage;
}

function getTemplateSelectionPayload(
  suggestion: TemplateSuggestion,
  coverImage: string | null,
) {
  return {
    ...suggestion.template,
    coverImage,
  };
}

function getTemplateGroupSizeText(template: TemplateSuggestion["template"]) {
  if (
    template.forgeMode === "AUTO" &&
    template.recommendedMinimumGroupSize !== null &&
    template.recommendedMaximumGroupSize !== null
  ) {
    return `${template.recommendedMinimumGroupSize}–${template.recommendedMaximumGroupSize} people`;
  }

  return template.fixedSize === null
    ? "Group size not set"
    : `${template.fixedSize} people`;
}

const TEMPLATE_TILE_PRESENTATION = {
  lead: {
    showDescription: true,
    titleClassName: "text-base",
  },
  "center-top": {
    showDescription: false,
    titleClassName: "text-sm",
  },
  "right-rail": {
    showDescription: false,
    titleClassName: "text-sm",
  },
  "center-bottom": {
    showDescription: false,
    titleClassName: "text-sm",
  },
  "lower-left": {
    showDescription: false,
    titleClassName: "text-sm",
  },
  closing: {
    showDescription: false,
    titleClassName: "text-sm",
  },
} satisfies Record<
  CompactBentoSlot,
  {
    showDescription: boolean;
    titleClassName: string;
  }
>;
