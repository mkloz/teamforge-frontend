import { ArrowDownWideNarrow } from "lucide-react";
import { SORTS } from "@/features/explore/constants/explore-filter-options";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Sort groups${activeSort ? `, ${activeSort.label}` : ""}`}
        className={cn(
          "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground outline-hidden transition-all",
          "hover:border-border hover:text-foreground focus-visible:ring-2 focus-visible:ring-forge-teal",
          "data-[state=open]:border-border data-[state=open]:text-foreground",
        )}
      >
        <ArrowDownWideNarrow className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortChange}>
          {SORTS.map(({ id, label }) => (
            <DropdownMenuRadioItem key={id} value={id}>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
