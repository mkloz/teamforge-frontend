import { LayoutList, Rows } from "lucide-react";
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

type ConversationFilterCounts = FilterHeaderProps["counts"];
type ConversationListDensity = NonNullable<FilterHeaderProps["density"]>;

const FILTER_BADGE_COUNT_SELECTORS = {
  all: (counts) => counts.allUnreadMessageCount,
  direct: (counts) => counts.dmUnreadMessageCount,
  groups: (counts) => counts.groupUnreadMessageCount,
  pinned: (counts) => counts.pinnedUnreadMessageCount,
  saved: () => 0,
  unread: (counts) => counts.allUnreadMessageCount,
} as const satisfies Record<
  FilterChip,
  (counts: ConversationFilterCounts) => number
>;

const FILTER_MOBILE_ORDER_CLASSES = {
  all: "order-1 md:order-none",
  groups: "order-2 md:order-none",
  direct: "order-3 md:order-none",
  unread: "order-4 md:order-none",
  pinned: "order-5 md:order-none",
  saved: "order-6 md:order-none",
} as const satisfies Partial<Record<FilterChip, string>>;

const FILTER_DEFAULT_MOBILE_ORDER_CLASS = "order-6 md:order-none";

const DENSITY_LABELS = {
  compact: "Default view",
  default: "Compact view",
} as const satisfies Record<ConversationListDensity, string>;

const NEXT_DENSITY = {
  compact: "default",
  default: "compact",
} as const satisfies Record<ConversationListDensity, ConversationListDensity>;

export function FilterHeader({
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
  const densityLabel = DENSITY_LABELS[density];
  const handleFilterChange = (value: string) => {
    const selectedFilter = filters.find((filter) => filter.key === value);

    if (selectedFilter) {
      onFilterChange(selectedFilter.key);
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-20 border-border/60 border-b px-2 pt-3 pb-2",
        "flex items-center gap-1 bg-canvas/85 backdrop-blur-md",
      )}
    >
      <RadioGroup
        value={activeFilter}
        onValueChange={handleFilterChange}
        aria-label="Filter conversations"
        className="scrollbar-hide flex min-w-0 flex-1 snap-x scroll-px-2 gap-1 overflow-x-auto pt-1.5 pr-1 pb-2 outline-none"
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

      <div className="flex shrink-0 items-center border-border/40 border-l pl-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="accentGhost"
              size="icon"
              className="size-8 rounded-full border border-border/55 bg-card/55 text-slate-muted hover:enabled:border-forge-teal/30 hover:enabled:bg-forge-teal/8 hover:enabled:text-forge-teal"
              onClick={() => onDensityChange?.(NEXT_DENSITY[density])}
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
}

function getBadgeCount(
  key: FilterChip,
  counts: ConversationFilterCounts,
): number | null {
  return FILTER_BADGE_COUNT_SELECTORS[key]?.(counts) ?? null;
}

function getFilterAriaLabel(label: string, count: number | null) {
  if (!count) {
    return label;
  }

  return `${label} ${count} unread`;
}

function getMobileFilterOrderClass(key: FilterChip) {
  return FILTER_MOBILE_ORDER_CLASSES[key] ?? FILTER_DEFAULT_MOBILE_ORDER_CLASS;
}
