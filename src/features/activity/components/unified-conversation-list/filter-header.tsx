import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import { FilterChipItem } from "./filter-chip-item";
import type { FilterChip } from "../../types/unified-conversation.types";
import { LayoutList, Rows } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface FilterHeaderProps {
  filters: { key: FilterChip; label: string }[];
  activeFilter: FilterChip;
  counts: {
    groupCount: number;
    dmCount: number;
    unreadCount: number;
  };
  density?: "default" | "compact";
  onFilterChange: (f: FilterChip) => void;
  onDensityChange?: (d: "default" | "compact") => void;
}

export const FilterHeader = memo(function FilterHeader({
  filters,
  activeFilter,
  counts,
  density = "default",
  onFilterChange,
  onDensityChange,
}: FilterHeaderProps) {
  const visibleFilters = filters.filter(
    (f) => f.key !== "unread" || counts.unreadCount > 0,
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = visibleFilters.findIndex(
      (f) => f.key === activeFilter,
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % visibleFilters.length;
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex =
        (currentIndex - 1 + visibleFilters.length) % visibleFilters.length;
      e.preventDefault();
    }

    if (nextIndex !== currentIndex) {
      onFilterChange(visibleFilters[nextIndex].key);
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-20 px-4 py-2 border-b border-border/60",
        "bg-canvas/80 backdrop-blur-md flex items-center justify-between",
      )}
    >
      <div
        role="radiogroup"
        aria-label="Filter conversations"
        className="flex gap-1.5 overflow-x-auto scrollbar-hide px-0.5 outline-none flex-1"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {visibleFilters.map(({ key, label }) => (
          <FilterChipItem
            key={key}
            label={label}
            isActive={activeFilter === key}
            onClick={() => onFilterChange(key)}
            badge={getBadgeCount(key, counts)}
          />
        ))}
      </div>

      <div className="flex items-center ml-2 border-l border-border/40 pl-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-lg text-slate-muted hover:text-forge-teal hover:bg-forge-teal/5 transition-colors"
          onClick={() =>
            onDensityChange?.(density === "default" ? "compact" : "default")
          }
          title={density === "default" ? "Compact view" : "Default view"}
        >
          {density === "default" ? (
            <LayoutList size={14} />
          ) : (
            <Rows size={14} />
          )}
        </Button>
      </div>
    </nav>
  );
});

function getBadgeCount(
  key: FilterChip,
  counts: { groupCount: number; dmCount: number; unreadCount: number },
): number | null {
  if (key === "groups") return counts.groupCount;
  if (key === "direct") return counts.dmCount;
  if (key === "unread") return counts.unreadCount;
  return null;
}
