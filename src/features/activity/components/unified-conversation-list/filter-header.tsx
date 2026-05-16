import { LayoutList, Rows } from "lucide-react";
import { memo } from "react";
import type { FilterChip } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { RadioGroup } from "@/shared/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { FilterChipItem } from "./filter-chip-item";

interface FilterHeaderProps {
  filters: { key: FilterChip; label: string }[];
  activeFilter: FilterChip;
  counts: {
    groupCount: number;
    dmCount: number;
    unreadCount: number;
    pinnedCount: number;
    savedCount: number;
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
    (f) =>
      (f.key !== "unread" || counts.unreadCount > 0) &&
      (f.key !== "pinned" ||
        counts.pinnedCount > 0 ||
        activeFilter === "pinned"),
  );
  const densityLabel = density === "default" ? "Compact view" : "Default view";
  const handleFilterChange = (value: string) => {
    const selectedFilter = filters.find((filter) => filter.key === value);

    if (selectedFilter) {
      onFilterChange(selectedFilter.key);
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-20 border-border/60 border-b px-2 py-1.5 md:px-4 md:py-1",
        "flex items-center justify-between bg-canvas/80 backdrop-blur-md",
      )}
    >
      <RadioGroup
        value={activeFilter}
        onValueChange={handleFilterChange}
        aria-label="Filter conversations"
        className="scrollbar-hide flex flex-1 snap-x gap-1.5 overflow-x-auto scroll-px-2 px-0.5 py-1 outline-none md:py-1.5"
      >
        {visibleFilters.map(({ key, label }) => {
          const badge = getBadgeCount(key, counts);

          return (
            <FilterChipItem
              key={key}
              label={label}
              isActive={activeFilter === key}
              value={key}
              badge={badge}
              ariaLabel={getFilterAriaLabel(label, badge)}
              className={getMobileFilterOrderClass(key)}
            />
          );
        })}
      </RadioGroup>

      <div className="ml-1.5 flex items-center border-border/40 border-l pl-1.5 md:ml-2 md:pl-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="accentGhost"
              size="icon"
              className="size-11 md:size-8"
              onClick={() =>
                onDensityChange?.(density === "default" ? "compact" : "default")
              }
              aria-label={densityLabel}
            >
              {density === "default" ? (
                <LayoutList className="size-3.5" />
              ) : (
                <Rows className="size-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{densityLabel}</TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
});

function getBadgeCount(
  key: FilterChip,
  counts: {
    groupCount: number;
    dmCount: number;
    unreadCount: number;
    pinnedCount: number;
    savedCount: number;
  },
): number | null {
  if (key === "groups") return counts.groupCount;
  if (key === "direct") return counts.dmCount;
  if (key === "unread") return counts.unreadCount;
  if (key === "pinned") return counts.pinnedCount;
  if (key === "saved") return counts.savedCount;
  return null;
}

function getFilterAriaLabel(label: string, count: number | null) {
  if (!count) {
    return label;
  }

  return `${label}, ${count}`;
}

function getMobileFilterOrderClass(key: FilterChip) {
  if (key === "all") return "order-1 md:order-none";
  if (key === "saved") return "order-2 md:order-none";
  if (key === "pinned") return "order-3 md:order-none";
  if (key === "groups") return "order-4 md:order-none";
  if (key === "direct") return "order-5 md:order-none";
  return "order-6 md:order-none";
}
