import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import { FilterChipItem } from "./filter-chip-item";
import type { FilterChip } from "../../types/unified-conversation.types";

interface FilterHeaderProps {
  filters: { key: FilterChip; label: string }[];
  activeFilter: FilterChip;
  counts: {
    groupCount: number;
    dmCount: number;
    unreadCount: number;
  };
  onFilterChange: (f: FilterChip) => void;
}

export const FilterHeader = memo(function FilterHeader({
  filters,
  activeFilter,
  counts,
  onFilterChange,
}: FilterHeaderProps) {
  return (
    <nav
      className={cn(
        "sticky top-0 z-20 px-4 py-2.5 border-b border-border/60",
        "bg-canvas/80 backdrop-blur-md",
      )}
    >
      <div
        role="radiogroup"
        aria-label="Filter conversations"
        className="flex gap-1.5 overflow-x-auto scrollbar-hide px-0.5"
      >
        {filters
          .filter((f) => f.key !== "unread" || counts.unreadCount > 0)
          .map(({ key, label }) => (
            <FilterChipItem
              key={key}
              label={label}
              isActive={activeFilter === key}
              onClick={() => onFilterChange(key)}
              badge={getBadgeCount(key, counts)}
            />
          ))}
      </div>
    </nav>
  );
});

function getBadgeCount(
  key: FilterChip,
  counts: { groupCount: number; dmCount: number; unreadCount: number },
): number | null {
  if (key === "groups") return counts.groupCount;
  if (key === "dms") return counts.dmCount;
  if (key === "unread") return counts.unreadCount;
  return null;
}
