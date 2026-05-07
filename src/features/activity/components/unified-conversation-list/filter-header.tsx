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
  const handleFilterChange = (value: string) => {
    const selectedFilter = filters.find((filter) => filter.key === value);

    if (selectedFilter) {
      onFilterChange(selectedFilter.key);
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-20 border-b border-border/60 px-4 py-1",
        "flex items-center justify-between bg-canvas/80 backdrop-blur-md",
      )}
    >
      <RadioGroup
        value={activeFilter}
        onValueChange={handleFilterChange}
        aria-label="Filter conversations"
        className="scrollbar-hide flex flex-1 gap-1.5 overflow-x-auto px-0.5 py-1.5 outline-none"
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

      <div className="ml-2 flex items-center border-l border-border/40 pl-2">
        <Button
          variant="accentGhost"
          size="icon"
          className="size-8"
          onClick={() =>
            onDensityChange?.(density === "default" ? "compact" : "default")
          }
          title={density === "default" ? "Compact view" : "Default view"}
        >
          {density === "default" ? (
            <LayoutList className="size-3.5" />
          ) : (
            <Rows className="size-3.5" />
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
