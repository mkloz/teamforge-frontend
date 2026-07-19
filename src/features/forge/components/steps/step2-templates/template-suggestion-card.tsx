import { ArrowRight, Check, Users, Wifi } from "lucide-react";

import { PlanCover } from "@/shared/components/common/plan-cover";
import { IconTile } from "@/shared/components/ui/icon-tile";
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";

import { ICON_MAP } from "../step1-activity/activity-icon-map";
import type { TemplateSuggestionCardProps } from "./types";

type TemplateSuggestion = TemplateSuggestionCardProps["suggestion"];

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

function getTemplateBadgeTone(badge: string): StatusPillTone {
  return badge === "Based on your profile" ? "teal" : "neutral";
}

function getTemplateBadgeClassName(badge: string) {
  return cn(
    badge === "Based on your profile" ? "bg-forge-teal/10" : "bg-muted",
  );
}

function getTemplateCardClassName(active: boolean) {
  return cn(
    "group flex h-24 min-w-0 overflow-hidden rounded-lg border bg-card text-left transition-colors duration-200 hover:border-forge-teal/35 hover:bg-forge-teal/5 active:scale-95",
    active
      ? "border-forge-teal/65 bg-forge-teal/10 ring-1 ring-forge-teal/20"
      : "border-border/40",
  );
}

function getTemplateTitleClassName(active: boolean) {
  return cn(
    "min-w-0 flex-1 truncate font-semibold text-sm leading-tight",
    active ? "text-forge-teal" : "text-foreground",
  );
}

export function TemplateSuggestionCard({
  active,
  onTemplateSelect,
  suggestion,
}: TemplateSuggestionCardProps) {
  const Icon = ICON_MAP[suggestion.categoryId] ?? ICON_MAP.fallback;
  const coverImage = getTemplateCoverImage(suggestion);
  const handleTemplateSelect = () => {
    onTemplateSelect(
      suggestion.id,
      getTemplateSelectionPayload(suggestion, coverImage),
    );
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={handleTemplateSelect}
      className={getTemplateCardClassName(active)}
    >
      <div className="relative w-20 shrink-0 overflow-hidden bg-muted sm:w-24">
        <PlanCover
          value={coverImage}
          alt=""
          className="size-full"
          imageClassName="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/10 transition-colors duration-200 group-hover:bg-foreground/0" />
        <IconTile
          icon={Icon}
          shape="circle"
          size="sm"
          tone="none"
          className="absolute top-2 left-2 bg-background/90 text-foreground shadow-sm backdrop-blur"
          iconClassName="size-3"
        />
        {active && (
          <IconTile
            icon={Check}
            shape="circle"
            size="sm"
            tone="teal"
            className="absolute top-2 right-2 size-6 bg-forge-teal text-white shadow-sm"
            iconClassName="size-3"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <p className={getTemplateTitleClassName(active)}>
            {suggestion.title}
          </p>
          <ArrowRight
            size={13}
            className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-forge-teal"
          />
        </div>
        <p className="line-clamp-1 text-muted-foreground text-xs leading-snug">
          {suggestion.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-micro text-muted-foreground">
              <Users aria-hidden="true" size={11} />
              {getTemplateGroupSizeText(suggestion.template)}
            </span>
            <OnlineTemplatePill
              locationType={suggestion.template.locationType}
            />
          </div>
          <StatusPill
            size="xs"
            tone={getTemplateBadgeTone(suggestion.badge)}
            surface="soft"
            className={getTemplateBadgeClassName(suggestion.badge)}
          >
            {suggestion.badge}
          </StatusPill>
        </div>
      </div>
    </button>
  );
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

function OnlineTemplatePill({
  locationType,
}: {
  locationType: TemplateSuggestion["template"]["locationType"];
}) {
  if (locationType !== "ONLINE") {
    return null;
  }

  return (
    <StatusPill
      icon={Wifi}
      iconClassName="size-2.5"
      size="xs"
      tone="teal"
      surface="soft"
      className="gap-1 px-1.5"
    >
      Online
    </StatusPill>
  );
}
