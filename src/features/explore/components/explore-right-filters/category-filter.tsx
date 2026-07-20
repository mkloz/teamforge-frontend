import { useState } from "react";
import { CATEGORIES } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { CategoryFilterChip } from "@/shared/components/ui/category-filter-chip";
import { cn } from "@/shared/lib/utils";
import type { PlanCategory } from "@/shared/schemas/enums";

const INITIAL_VISIBLE_CATEGORY_COUNT = 5;

export function CategoryFilter() {
  const { selectedCategories, setSelectedCategories } = useExploreRouteState();
  const [expanded, setExpanded] = useState(false);
  const visibleCategories = getVisibleCategories(expanded, selectedCategories);
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
    <div className="flex flex-wrap gap-1.5 py-1">
      {visibleCategories.map((cat) => {
        const active = selectedCategories.includes(cat.id);
        return (
          <CategoryFilterChip
            key={cat.id}
            label={cat.label}
            selected={active}
            className={cn(
              "h-11 border px-2.5 text-xs transition-colors hover:border-border/90 hover:bg-muted/35 hover:text-foreground active:translate-y-0 lg:h-7",
              active &&
                "border-forge-teal/35 bg-forge-teal/9 text-forge-teal hover:border-forge-teal/45 hover:bg-forge-teal/12",
            )}
            onClick={() => toggleCategory(cat.id)}
          />
        );
      })}
      {!expanded && hiddenCategoryCount > 0 ? (
        <CategoryFilterChip
          label={`+${hiddenCategoryCount} more`}
          className="h-11 px-2.5 lg:h-7"
          onClick={() => setExpanded(true)}
        />
      ) : null}
      {expanded ? (
        <CategoryFilterChip
          label="Show less"
          className="h-11 px-2.5 lg:h-7"
          onClick={() => setExpanded(false)}
        />
      ) : null}
    </div>
  );
}

function getVisibleCategories(
  expanded: boolean,
  selectedCategories: Array<PlanCategory | "ALL">,
) {
  if (expanded) {
    return CATEGORIES;
  }

  const starterCategories = CATEGORIES.slice(0, INITIAL_VISIBLE_CATEGORY_COUNT);
  const selectedHiddenCategories = CATEGORIES.slice(
    INITIAL_VISIBLE_CATEGORY_COUNT,
  ).filter((category) => selectedCategories.includes(category.id));

  return [...starterCategories, ...selectedHiddenCategories];
}
