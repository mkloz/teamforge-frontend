import { cn } from "@/shared/lib/utils";
import { CATEGORIES } from "../constants/explore.constants";
import { useExploreStore } from "../store/use-explore-store";
import type { PlanCategory } from "@/shared/schemas/enums";

export function CategoryFilter() {
  const { selectedCategories, setSelectedCategories } = useExploreStore();

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
          <button
            key={cat.id}
            type="button"
            onClick={() => toggleCategory(cat.id)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-150 active:scale-95",
              active
                ? "bg-forge-teal text-white border-2 border-button-primary-border shadow-button-primary -translate-y-0.5"
                : "bg-background border-2 border-border text-muted-foreground hover:border-forge-teal/50 hover:text-foreground",
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
