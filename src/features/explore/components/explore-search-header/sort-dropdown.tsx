import { ArrowDownWideNarrow } from "lucide-react";
import { SORTS } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { cn } from "@/shared/lib/utils";

export function SortDropdown() {
  const { sortBy, setSortBy } = useExploreRouteState();
  const activeSort = SORTS.find((sort) => sort.id === sortBy);

  function handleSortChange(value: string) {
    const nextSort = SORTS.find((sort) => sort.id === value);

    if (nextSort) {
      setSortBy(nextSort.id);
    }
  }

  return (
    <div className="relative size-9 shrink-0">
      <select
        aria-label={`Sort groups${activeSort ? `, ${activeSort.label}` : ""}`}
        value={sortBy}
        onChange={(event) => handleSortChange(event.target.value)}
        className="absolute inset-0 z-10 size-full cursor-pointer rounded-full opacity-0"
      >
        {SORTS.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <div
        aria-hidden="true"
        className={cn(
          "flex size-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all",
          "hover:border-border hover:text-foreground",
        )}
      >
        <ArrowDownWideNarrow className="size-3.5" />
      </div>
    </div>
  );
}
