import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { INTEREST_CATEGORIES } from "../../../data/interests-data";

const SHORT_CAT_LABELS: Record<string, string> = {
  careers: "Career",
  lifestyle: "Lifestyle",
  entertainment: "Entertainment",
  sports_outdoors: "Sports & Outdoors",
  hobbies_creating: "Hobbies",
};

interface InterestsBrowseHeaderProps {
  searchQuery: string;
  onSetSearch: (q: string) => void;
  onExpandCategoryOnly: (id: string) => void;
  variant: "pills" | "search";
}

export function InterestsBrowseHeader({
  searchQuery,
  onSetSearch,
  onExpandCategoryOnly,
  variant,
}: InterestsBrowseHeaderProps) {
  function handleQuickJump(catId: string) {
    onExpandCategoryOnly(catId);
    // Give the accordion time to animate open before scrolling
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById(`category-${catId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    });
  }

  if (variant === "pills") {
    return (
      <nav className="flex overflow-x-auto scrollbar-hide gap-1.5 sm:gap-2 scroll-smooth items-center h-10">
        {INTEREST_CATEGORIES.map((cat) => (
          <button
            type="button"
            key={`nav-${cat.id}`}
            onClick={() => handleQuickJump(cat.id)}
            className="group flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-white hover:bg-canvas hover:border-slate-muted/30 px-3 py-1.5 text-xs font-bold text-slate-muted transition active:scale-95 border border-slate-muted/15 shadow-sm"
          >
            <div
              className={cn("w-1.5 h-1.5 rounded-full shrink-0", cat.color)}
            />
            {SHORT_CAT_LABELS[cat.id] || cat.label}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <div className="relative group w-full">
      <Search
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-muted/60 group-focus-within:text-forge-teal transition-colors"
        strokeWidth={2.5}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSetSearch(e.target.value)}
        placeholder="Search 500+ interests…"
        aria-label="Search interests"
        className="w-full pl-10 pr-10 h-10 bg-white border border-slate-muted/15 rounded-xl text-sm font-sans text-ink placeholder:text-slate-muted/40 focus:bg-white focus:outline-none focus:ring-thick focus:ring-forge-teal/15 focus:border-forge-teal transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSetSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-muted/10 rounded-full transition-colors"
          aria-label="Clear search"
        >
          <X size={16} className="text-slate-muted/50" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
