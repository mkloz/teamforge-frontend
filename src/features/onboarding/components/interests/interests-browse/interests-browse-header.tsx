import { Search, X } from "lucide-react";
import {
  getCategoryColorClass,
  getCategoryShortLabel,
} from "@/features/onboarding/lib/interest-catalog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { Interest } from "@/shared/schemas";

interface InterestsBrowseHeaderProps {
  categories: Interest[];
  searchQuery: string;
  onSetSearch: (q: string) => void;
  onQuickJumpCategory: (id: string) => void;
  variant: "pills" | "search";
}

export function InterestsBrowseHeader({
  categories,
  searchQuery,
  onSetSearch,
  onQuickJumpCategory,
  variant,
}: InterestsBrowseHeaderProps) {
  if (variant === "pills") {
    return (
      <nav className="scrollbar-hide -m-1 flex h-10 items-center gap-1.5 overflow-x-auto scroll-smooth px-1 py-1 sm:gap-2">
        {categories.map((category) => (
          <Button
            variant="outline"
            size="xs"
            key={`nav-${category.id}`}
            onClick={() => onQuickJumpCategory(category.id)}
            className="shrink-0 rounded-full border-slate-muted/15 bg-card text-slate-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30 focus-visible:ring-offset-1 dark:border-white/10"
          >
            <div
              className={cn(
                "size-1.5 shrink-0 rounded-full",
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
    <div className="mt-2 w-full">
      <Input
        id="interests-search"
        name="interests-search"
        type="search"
        value={searchQuery}
        onChange={(e) => onSetSearch(e.target.value)}
        placeholder="Search interests…"
        aria-label="Search interests"
        className="h-11 pr-12 [@media(pointer:fine)]:h-9 [@media(pointer:fine)]:pr-9"
        leftIcon={<Search size={14} strokeWidth={2.5} />}
        rightIcon={
          searchQuery ? (
            <Button
              variant="accentGhost"
              size="icon-sm"
              onClick={() => onSetSearch("")}
              className="size-11 rounded-full [@media(pointer:fine)]:size-8"
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
