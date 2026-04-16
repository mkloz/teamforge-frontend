import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Clock, Search, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

// Placeholder data — will be replaced with real data from API
const RECENT_SEARCHES = [
  "Basketball pickup",
  "Coffee study group",
  "Weekend hiking",
];

const TRENDING_ACTIVITIES = [
  { label: "Board Game Night", category: "Social" },
  { label: "Morning Run Club", category: "Sports" },
  { label: "Photography Walk", category: "Arts" },
  { label: "Coding Hackathon", category: "Tech" },
];

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Focus input when overlay opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Clear query when closing
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setQuery(""), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const showPlaceholders = query.length === 0;

  return (
    <div
      role="dialog"
      aria-label="Search"
      aria-modal="true"
      aria-hidden={!open}
      // @ts-expect-error — inert is valid HTML but not yet in React types
      inert={!open ? "" : undefined}
      className={cn(
        "fixed inset-0 z-60 flex flex-col bg-background transition-opacity duration-200",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      {/* Input row */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <Search
          size={18}
          className="shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activities, people, groups..."
          className={cn(
            "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground",
            "text-base outline-none border-none ring-0",
          )}
          aria-label="Search"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close search"
          className="h-9 w-9 rounded-xl text-muted-foreground shrink-0"
        >
          <X size={18} aria-hidden="true" />
        </Button>
      </div>

      {/* Results / placeholder area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {showPlaceholders ? (
          <div className="max-w-lg mx-auto space-y-8">
            {/* Recent Searches */}
            {RECENT_SEARCHES.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Clock
                    size={14}
                    className="text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recent Searches
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {RECENT_SEARCHES.map((term) => (
                    <Button
                      key={term}
                      variant="ghost"
                      size="xs"
                      onClick={() => setQuery(term)}
                      className="rounded-full bg-secondary/80 text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-all active:scale-95"
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Activities */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp
                  size={14}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Trending Activities
                </h3>
              </div>
              <div className="grid gap-3">
                {TRENDING_ACTIVITIES.map((activity) => (
                  <Button
                    key={activity.label}
                    variant="outline"
                    onClick={() => setQuery(activity.label)}
                    className="flex items-center justify-between h-auto px-4 py-3.5 rounded-2xl text-left border-border/60 bg-card hover:border-primary/30 transition-all hover:bg-card active:scale-[0.99]"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {activity.label}
                    </span>
                    <span className="text-xs text-muted-foreground opacity-70">
                      {activity.category}
                    </span>
                  </Button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            <p className="text-sm text-muted-foreground text-center mt-16">
              Searching for "{query}"...
            </p>
            {/* Real search results will replace this placeholder */}
          </div>
        )}
      </div>
    </div>
  );
}
