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
    pinnedCount: number;
    allUnreadMessageCount: number;
    groupUnreadMessageCount: number;
    dmUnreadMessageCount: number;
    pinnedUnreadMessageCount: number;
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
      f.key !== "pinned" || counts.pinnedCount > 0 || activeFilter === "pinned",
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
        "sticky top-0 z-20 border-border/60 border-b px-3 pt-3 pb-2",
        "flex items-center gap-2 bg-canvas/85 backdrop-blur-md",
      )}
    >
      <RadioGroup
        value={activeFilter}
        onValueChange={handleFilterChange}
        aria-label="Filter conversations"
        className="scrollbar-hide flex min-w-0 flex-1 snap-x scroll-px-3 gap-1.5 overflow-x-auto pt-1.5 pr-1 pb-2 outline-none"
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

      <div className="flex shrink-0 items-center border-border/40 border-l pl-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="accentGhost"
              size="icon"
              className="size-8 rounded-full border border-border/55 bg-card/55 text-slate-muted hover:enabled:border-forge-teal/30 hover:enabled:bg-forge-teal/8 hover:enabled:text-forge-teal"
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
    pinnedCount: number;
    allUnreadMessageCount: number;
    groupUnreadMessageCount: number;
    dmUnreadMessageCount: number;
    pinnedUnreadMessageCount: number;
  },
): number | null {
  if (key === "all") return counts.allUnreadMessageCount;
  if (key === "groups") return counts.groupUnreadMessageCount;
  if (key === "direct") return counts.dmUnreadMessageCount;
  if (key === "unread") return counts.allUnreadMessageCount;
  if (key === "pinned") return counts.pinnedUnreadMessageCount;
  return null;
}

function getFilterAriaLabel(label: string, count: number | null) {
  if (!count) {
    return label;
  }

  return `${label}, ${count} unread`;
}

function getMobileFilterOrderClass(key: FilterChip) {
  if (key === "all") return "order-1 md:order-none";
  if (key === "groups") return "order-2 md:order-none";
  if (key === "direct") return "order-3 md:order-none";
  if (key === "unread") return "order-4 md:order-none";
  if (key === "pinned") return "order-5 md:order-none";
  if (key === "saved") return "order-6 md:order-none";
  return "order-6 md:order-none";
}
