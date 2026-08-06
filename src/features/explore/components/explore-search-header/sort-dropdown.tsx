import { ArrowDownUp, Check, ChevronDown } from "lucide-react";
import { SORTS } from "@/features/explore/constants/explore-filter-options";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import type { ExploreSortOption } from "@/features/explore/schemas/explore-filters.schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

const SORT_DESCRIPTIONS: Record<ExploreSortOption, string> = {
  MATCH: "Closest to your profile.",
  NEWEST: "Recently created groups first.",
  SOONEST: "Plans happening earliest.",
};

export function SortDropdown() {
  const { sortBy, setSortBy } = useExploreRouteState();
  const activeSort = SORTS.find((sort) => sort.id === sortBy);
  const ActiveIcon = activeSort?.icon ?? ArrowDownUp;
  const activeLabel = activeSort?.label ?? "Recommended";

  function handleSortChange(value: string) {
    const nextSort = SORTS.find((sort) => sort.id === value);

    if (nextSort) {
      setSortBy(nextSort.id);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Sort groups, ${activeLabel}`}
        className={cn(
          "group inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-input px-2 text-muted-foreground shadow-xs outline-hidden transition-all duration-150",
          "hover:border-primary/35 hover:bg-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/35",
          "data-[state=open]:border-primary/35 data-[state=open]:bg-card data-[state=open]:text-ink",
        )}
      >
        <ActiveIcon
          className="size-3.5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <span className="font-semibold text-slate-muted text-xs">Sort</span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="font-black text-ink text-xs">{activeLabel}</span>
        </span>
        <ChevronDown
          className="hidden size-3.5 text-slate-muted transition-transform duration-150 group-data-[state=open]:rotate-180 sm:block"
          strokeWidth={2}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 max-w-[calc(100vw-2rem)] rounded-xl border-border/80 bg-popover p-2 shadow-2xl shadow-ink/10"
      >
        <DropdownMenuLabel className="px-2 pt-1 pb-2 font-bold text-slate-muted text-xs">
          Sort groups
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortChange}>
          {SORTS.map(({ icon: Icon, id, label }) => {
            const selected = sortBy === id;

            return (
              <DropdownMenuRadioItem
                key={id}
                value={id}
                className={cn(
                  "grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-2 text-left focus:bg-primary/8 focus:text-ink data-[state=checked]:bg-primary/8 data-[state=checked]:text-ink [&>span:first-child]:hidden",
                  selected ? "text-ink" : "text-slate-muted",
                )}
              >
                <IconTile
                  icon={Icon}
                  size="md"
                  tone={selected ? "teal" : "neutral"}
                  className={cn(
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-input text-slate-muted",
                  )}
                  iconClassName="size-3.5"
                />
                <span className="min-w-0">
                  <span className="block font-black text-sm">{label}</span>
                  <span className="mt-0.5 block text-slate-muted text-xs leading-snug">
                    {SORT_DESCRIPTIONS[id]}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-input text-transparent",
                  )}
                  aria-hidden="true"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
