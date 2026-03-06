import { Search, X } from "lucide-react";
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
}

export function InterestsBrowseHeader({
  searchQuery,
  onSetSearch,
  onExpandCategoryOnly,
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

  return (
    <div className="flex flex-col gap-3">
      {/* Quick-jump navigation */}
      <nav className="flex overflow-x-auto no-scrollbar gap-2 -mx-5 px-5 lg:mx-0 lg:px-0">
        {INTEREST_CATEGORIES.map((cat) => (
          <button
            type="button"
            key={`nav-${cat.id}`}
            onClick={() => handleQuickJump(cat.id)}
            className="group flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-50 hover:bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500 transition-all active:scale-95 border-2"
          >
            {SHORT_CAT_LABELS[cat.id] || cat.label}
          </button>
        ))}
      </nav>

      <div className="relative group">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-forge-teal transition-colors"
          strokeWidth={2.5}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSetSearch(e.target.value)}
          placeholder="Search 500+ interests…"
          aria-label="Search interests"
          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-forge-teal/10 focus:border-forge-teal transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSetSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X size={12} className="text-slate-500" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
