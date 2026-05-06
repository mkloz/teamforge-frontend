import { Button } from "@/shared/components/ui/button";
import { RadioGroup } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";
import { LayoutList, Rows } from "lucide-react";
import { memo } from "react";
import type { FilterChip } from "@/features/activity/lib/activity-contract";
import { FilterChipItem } from "./filter-chip-item";

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

  return (
    <nav
      className={cn(
        "sticky top-0 z-20 px-4 py-1 border-b border-border/60",
        "bg-canvas/80 backdrop-blur-md flex items-center justify-between",
      )}
    >
      <RadioGroup
        value={activeFilter}
        onValueChange={(value) => onFilterChange(value as FilterChip)}
        aria-label="Filter conversations"
        className="flex gap-1.5 overflow-x-auto scrollbar-hide px-0.5 py-1.5 outline-none flex-1"
      >
        {visibleFilters.map(({ key, label }) => (
          <FilterChipItem
            key={key}
            label={label}
            isActive={activeFilter === key}
            value={key}
            badge={getBadgeCount(key, counts)}
          />
        ))}
      </RadioGroup>

      <div className="flex items-center ml-2 border-l border-border/40 pl-2">
        <Button
          variant="accentGhost"
          size="icon"
          className="h-8 w-8"
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
