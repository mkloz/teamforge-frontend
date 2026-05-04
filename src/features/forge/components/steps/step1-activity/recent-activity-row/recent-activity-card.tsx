import { Check } from "lucide-react";

import { Image } from "@/shared/components/common/image";
import dayjs from "@/shared/lib/dayjs";
import { cn } from "@/shared/lib/utils";

import { ICON_MAP } from "../activity-icon-map";
import type { RecentActivityCardProps } from "./types";

function getUsageLabel(count: number) {
  return count === 1 ? "1 time" : `${count} times`;
}

export function RecentActivityCard({
  activity,
  active,
  recommended,
  onTemplateToggle,
}: RecentActivityCardProps) {
  const Icon = ICON_MAP[activity.categoryId] || ICON_MAP.fallback;
  const templateId = `recent:${activity.id}`;
  const hasCoverImage = Boolean(activity.template.coverImage);

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onTemplateToggle(templateId, activity.template)}
      className={cn(
        "group flex h-14 min-w-0 overflow-hidden rounded-lg border bg-card text-left transition-[background-color,border-color,transform] duration-200 active:scale-[0.98]",
        active
          ? "border-spark-amber/65 bg-spark-amber/10 ring-1 ring-spark-amber/20"
          : recommended
            ? "border-forge-teal/45 bg-forge-teal/5"
            : "border-border/40 bg-card hover:border-forge-teal/30 hover:bg-forge-teal/5",
      )}
    >
      <div
        className={cn(
          "relative flex h-full w-14 shrink-0 items-center justify-center overflow-hidden",
          active
            ? "bg-spark-amber/14"
            : recommended
              ? "bg-forge-teal/10"
              : "bg-muted/80",
        )}
      >
        {hasCoverImage && (
          <>
            <Image
              src={activity.template.coverImage ?? undefined}
              alt=""
              wrapperClassName="absolute inset-0 h-full w-full"
              className="transition-transform duration-700 ease-out group-hover:scale-105"
              showNoImage={false}
            />
            <div
              className={cn(
                "absolute inset-0 transition-colors duration-200",
                active
                  ? "bg-spark-amber/24"
                  : recommended
                    ? "bg-forge-teal/16"
                    : "bg-foreground/10 group-hover:bg-foreground/0",
              )}
            />
          </>
        )}
        <div
          className={cn(
            "relative z-10 flex size-7 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors duration-200",
            active
              ? "bg-spark-amber text-ink"
              : recommended
                ? "bg-forge-teal text-white"
                : hasCoverImage
                  ? "bg-background/90 text-foreground"
                  : "bg-background/70 text-muted-foreground group-hover:text-foreground",
          )}
        >
          <Icon size={13} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-xs font-semibold leading-tight",
              active
                ? "text-spark-amber"
                : recommended
                  ? "text-forge-teal"
                  : "text-foreground",
            )}
          >
            {activity.title}
          </p>
          <p className="mt-1 truncate text-micro font-medium leading-none text-muted-foreground">
            {getUsageLabel(activity.count)} -{" "}
            {dayjs(activity.lastUsedAt).fromNow()}
          </p>
        </div>

        {active && (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-spark-amber text-ink">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>
    </button>
  );
}
