import { ArrowRight, Check, Users, Wifi } from "lucide-react";

import { Image } from "@/shared/components/common/image";
import { cn } from "@/shared/lib/utils";

import { ICON_MAP } from "../step1-activity/activity-icon-map";
import type { TemplateSuggestionCardProps } from "./types";

export function TemplateSuggestionCard({
  active,
  onTemplateToggle,
  suggestion,
}: TemplateSuggestionCardProps) {
  const Icon = ICON_MAP[suggestion.categoryId] ?? ICON_MAP.fallback;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onTemplateToggle(suggestion.id, suggestion.template)}
      className={cn(
        "group flex h-24 min-w-0 overflow-hidden rounded-lg border bg-card text-left transition-colors duration-200 hover:border-forge-teal/35 hover:bg-forge-teal/5 active:scale-[0.98]",
        active
          ? "border-forge-teal/65 bg-forge-teal/10 ring-1 ring-forge-teal/20"
          : "border-border/40",
      )}
    >
      <div className="relative w-20 shrink-0 overflow-hidden bg-muted sm:w-24">
        <Image
          src={suggestion.template.coverImage ?? undefined}
          alt=""
          wrapperClassName="h-full w-full"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/10 transition-colors duration-200 group-hover:bg-foreground/0" />
        <div className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur">
          <Icon size={13} />
        </div>
        {active && (
          <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-forge-teal text-white shadow-sm">
            <Check size={12} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-sm font-semibold leading-tight",
              active ? "text-forge-teal" : "text-foreground",
            )}
          >
            {suggestion.title}
          </p>
          <ArrowRight
            size={13}
            className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-forge-teal"
          />
        </div>
        <p className="line-clamp-1 text-xs leading-snug text-muted-foreground">
          {suggestion.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 text-micro font-semibold text-muted-foreground">
              <Users size={11} />
              {suggestion.template.fixedSize}
            </span>
            {suggestion.template.locationType === "ONLINE" && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-forge-teal/10 px-1.5 py-0.5 text-micro font-semibold text-forge-teal">
                <Wifi size={10} />
                Online
              </span>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-micro font-semibold",
              suggestion.badge === "Personal fit"
                ? "bg-forge-teal/10 text-forge-teal"
                : "bg-muted text-muted-foreground",
            )}
          >
            {suggestion.badge}
          </span>
        </div>
      </div>
    </button>
  );
}
