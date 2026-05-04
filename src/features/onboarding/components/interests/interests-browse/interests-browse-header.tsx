import type { Interest } from "@/shared/schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
    <div className="w-full mt-2">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => onSetSearch(e.target.value)}
        placeholder="Search interests…"
        aria-label="Search interests"
        leftIcon={<Search size={14} strokeWidth={2.5} />}
        rightIcon={
          searchQuery ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onSetSearch("")}
              className="size-8 rounded-full text-slate-muted hover:text-forge-teal"
              aria-label="Clear search"
            >
              <X size={16} strokeWidth={2.5} />
            </Button>
          ) : null
        }
      />
    </div>
  );
}
