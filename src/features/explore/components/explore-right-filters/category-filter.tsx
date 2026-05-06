import { CATEGORIES } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import type { PlanCategory } from "@/shared/schemas/enums";
import { CategoryFilterChip } from "@/shared/components/ui/category-filter-chip";
import { cn } from "@/shared/lib/utils";
import { useMemo, useState } from "react";

const INITIAL_VISIBLE_CATEGORY_COUNT = 5;

export function CategoryFilter() {
  const { selectedCategories, setSelectedCategories } = useExploreRouteState();
  const [expanded, setExpanded] = useState(false);
  const visibleCategories = useMemo(() => {
    if (expanded) {
      return CATEGORIES;
    }

    const starterCategories = CATEGORIES.slice(
      0,
      INITIAL_VISIBLE_CATEGORY_COUNT,
    );
    const selectedHiddenCategories = CATEGORIES.slice(
      INITIAL_VISIBLE_CATEGORY_COUNT,
    ).filter((category) => selectedCategories.includes(category.id));

    return [...starterCategories, ...selectedHiddenCategories];
  }, [expanded, selectedCategories]);
  const hiddenCategoryCount = CATEGORIES.length - visibleCategories.length;

  const toggleCategory = (catId: PlanCategory | "ALL") => {
    if (catId === "ALL") {
      setSelectedCategories(["ALL"]);
      return;
    }

    const next = selectedCategories.filter((c) => c !== "ALL");
    let newSelected: (PlanCategory | "ALL")[] = [];

    if (next.includes(catId)) {
      newSelected = next.filter((c) => c !== catId);
      if (newSelected.length === 0) newSelected = ["ALL"];
    } else {
      newSelected = [...next, catId];
    }

    setSelectedCategories(newSelected);
  };

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-2.5 py-2">
      {visibleCategories.map((cat) => {
        const active = selectedCategories.includes(cat.id);
        return (
          <CategoryFilterChip
            key={cat.id}
            label={cat.label}
            selected={active}
            className={cn(
              "h-9 border px-4 text-sm transition-[border-color,background-color,color] hover:border-border/90 hover:bg-muted/35 hover:text-foreground active:translate-y-0",
              active &&
                "border-forge-teal/35 bg-forge-teal/[0.09] text-forge-teal hover:border-forge-teal/45 hover:bg-forge-teal/[0.12] hover:text-forge-teal",
            )}
            onClick={() => toggleCategory(cat.id)}
          />
        );
      })}
      {!expanded && hiddenCategoryCount > 0 ? (
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-bold text-muted-foreground transition-[border-color,background-color,color] hover:border-border/90 hover:bg-muted/35 hover:text-foreground"
          onClick={() => setExpanded(true)}
        >
          +{hiddenCategoryCount} more
        </button>
      ) : null}
      {expanded ? (
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-bold text-muted-foreground transition-[border-color,background-color,color] hover:border-border/90 hover:bg-muted/35 hover:text-foreground"
          onClick={() => setExpanded(false)}
        >
          Show less
        </button>
      ) : null}
    </div>
  );
}
