import { CATEGORIES } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import type { PlanCategory } from "@/shared/schemas/enums";
import { CategoryFilterChip } from "@/shared/components/ui/category-filter-chip";

export function CategoryFilter() {
  const { selectedCategories, setSelectedCategories } = useExploreRouteState();

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
    <div className="flex flex-wrap gap-x-1.5 gap-y-2 py-2">
      {CATEGORIES.map((cat) => {
        const active = selectedCategories.includes(cat.id);
        return (
          <CategoryFilterChip
            key={cat.id}
            label={cat.label}
            selected={active}
            onClick={() => toggleCategory(cat.id)}
          />
        );
      })}
    </div>
  );
}
