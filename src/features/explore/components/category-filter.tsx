import { cn } from "@/shared/lib/utils";
import { CATEGORIES } from "../constants/explore.constants";
import { useExploreStore } from "../store/use-explore-store";

export function CategoryFilter() {
  const { selectedCategories, setSelectedCategories } = useExploreStore();

  const toggleCategory = (cat: string) => {
    if (cat === "All") {
      setSelectedCategories(["All"]);
      return;
    }

    let newSelected = selectedCategories.filter((c) => c !== "All");
    if (newSelected.includes(cat)) {
      newSelected = newSelected.filter((c) => c !== cat);
      if (newSelected.length === 0) newSelected = ["All"];
    } else {
      newSelected = [...newSelected, cat];
    }
    setSelectedCategories(newSelected);
  };

  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-2 py-2">
      {CATEGORIES.map((cat) => {
        const active = selectedCategories.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => toggleCategory(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-150 active:scale-95",
              active
                ? "bg-forge-teal text-white border-2 border-button-primary-border shadow-button-primary -translate-y-0.5"
                : "bg-background border-2 border-border text-muted-foreground hover:border-forge-teal/50 hover:text-foreground",
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
