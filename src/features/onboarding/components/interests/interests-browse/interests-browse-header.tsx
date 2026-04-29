import type { Interest } from "@/shared/schemas";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Search, X } from "lucide-react";
import {
  getCategoryColorClass,
  getCategoryShortLabel,
} from "../../../lib/interest-catalog";

interface InterestsBrowseHeaderProps {
  categories: Interest[];
  searchQuery: string;
  onSetSearch: (q: string) => void;
  onExpandCategoryOnly: (id: string) => void;
  variant: "pills" | "search";
}

export function InterestsBrowseHeader({
  categories,
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
      <nav className="flex overflow-x-auto scrollbar-hide gap-1.5 sm:gap-2 scroll-smooth items-center h-10 py-1 -m-1 px-1">
        {categories.map((category) => (
          <Button
            variant="outline"
            size="xs"
            key={`nav-${category.id}`}
            onClick={() => handleQuickJump(category.id)}
            className="rounded-full bg-card text-slate-muted border-slate-muted/15 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-forge-teal/30 focus-visible:ring-offset-1 focus-visible:outline-none shrink-0"
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                getCategoryColorClass(category.id),
              )}
            />
            {getCategoryShortLabel(category.id, category.name)}
          </Button>
        ))}
      </nav>
    );
  }

  return (
    <div className="relative group w-full mt-2">
      <Search
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-muted/60 group-focus-within:text-forge-teal transition-colors"
        strokeWidth={2.5}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSetSearch(e.target.value)}
        placeholder="Search interests…"
        aria-label="Search interests"
        className="w-full pl-10 pr-10 h-10 bg-card border border-slate-muted/15 dark:border-white/10 rounded-xl text-sm font-sans text-ink placeholder:text-slate-muted/50 focus:bg-card focus:outline-none focus:ring-thick focus:ring-forge-teal/15 focus:border-forge-teal transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSetSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full active:translate-y-[-50%]!"
          aria-label="Clear search"
        >
          <X size={16} className="text-slate-muted/50" strokeWidth={2.5} />
        </Button>
      )}
    </div>
  );
}
