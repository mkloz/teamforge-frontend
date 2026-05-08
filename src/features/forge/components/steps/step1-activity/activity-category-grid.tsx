import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import { buildCategoryFitHighlights } from "@/features/forge/lib/forge-template-suggestions";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { cn } from "@/shared/lib/utils";
import { ICON_MAP } from "./activity-icon-map";

interface ActivityCategoryGridProps {
  selectedActivity: string | null;
  shaking: boolean;
  onSelect: (activity: string | null) => void;
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
  const fitRankByCategory = new Map(
    fitHighlights.map((fit, index) => [fit.categoryId, index + 1]),
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <p className="text-xs leading-none font-semibold text-muted-foreground">
            Choose a category
          </p>
          <p className="mt-1 text-micro leading-none text-muted-foreground/55">
            Pick a style and we&apos;ll find the right people.
          </p>
        </div>
        <p className="shrink-0 text-micro leading-none font-semibold text-muted-foreground/50">
          {ACTIVITIES.length} options
        </p>
      </div>

      <div
        className={cn(
          "grid grid-cols-2 gap-2 transition-transform sm:grid-cols-3 lg:grid-cols-4",
          shaking && "animate-[shake_0.45s_ease-in-out]",
        )}
      >
        {ACTIVITIES.map(({ id, label, description }) => {
          const Icon = ICON_MAP[id] || ICON_MAP.fallback;
          const selected = selectedActivity === label;
          const personalised = fitRankByCategory.has(id);

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(selected ? null : label)}
              aria-pressed={selected}
              className={cn(
                "group relative flex min-h-20 min-w-0 flex-col gap-2 rounded-lg border px-3 py-2.5 text-left whitespace-normal transition duration-200 active:scale-[0.98]",
                selected
                  ? "border-spark-amber/65 bg-spark-amber/10 shadow-sm ring-1 ring-spark-amber/20"
                  : personalised
                    ? "border-forge-teal/35 bg-forge-teal/5 hover:border-forge-teal/50 hover:bg-forge-teal/10"
                    : "border-border/40 bg-card/80 hover:border-forge-teal/30 hover:bg-forge-teal/5",
              )}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                      selected
                        ? "bg-spark-amber text-ink shadow-sm shadow-spark-amber/25"
                        : personalised
                          ? "bg-forge-teal/10 text-forge-teal group-hover:bg-forge-teal/15"
                          : "bg-muted text-muted-foreground group-hover:bg-forge-teal/10 group-hover:text-forge-teal",
                    )}
                  >
                    <Icon size={15} />
                  </span>
                  <p
                    className={cn(
                      "min-w-0 leading-[1.1] font-semibold text-pretty",
                      label.length > 18
                        ? "text-[12.5px]"
                        : label.length > 13
                          ? "text-[13px]"
                          : "text-sm",
                      selected ? "text-spark-amber" : "text-foreground",
                    )}
                  >
                    <ActivityLabel label={label} />
                  </p>
                </div>

                {selected && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-spark-amber text-ink">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>

              <p className="line-clamp-2 min-w-0 text-xs leading-snug text-wrap text-muted-foreground">
                {description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
