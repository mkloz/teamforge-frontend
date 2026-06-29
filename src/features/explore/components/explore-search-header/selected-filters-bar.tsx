import { X } from "lucide-react";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
} from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Button } from "@/shared/components/ui/button";
import { FilterTag } from "./filter-tag";

type ExploreRouteState = ReturnType<typeof useExploreRouteState>;

interface SelectedFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function SelectedFiltersBar() {
  const routeState = useExploreRouteState();
  const selectedFilterChips = getSelectedFilterChips(routeState);

  if (selectedFilterChips.length === 0) return null;

  return (
    <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto py-1">
      <Button
        type="button"
        variant="subtle"
        size="xs"
        onClick={routeState.resetFilters}
        className="h-auto shrink-0 gap-1 rounded-full px-2.5 py-1 text-micro"
      >
        <X className="size-3" strokeWidth={2.5} />
        Clear all
      </Button>

      <div className="h-4 w-px shrink-0 bg-border/50" />

      <div className="flex items-center gap-1.5 pr-1">
        <SelectedFilterChipList chips={selectedFilterChips} />
      </div>
    </div>
  );
}

function SelectedFilterChipList({ chips }: { chips: SelectedFilterChip[] }) {
  return (
    <>
      {chips.map((chip) => (
        <FilterTag key={chip.key} label={chip.label} onRemove={chip.onRemove} />
      ))}
    </>
  );
}

function getSelectedFilterChips(
  routeState: ExploreRouteState,
): SelectedFilterChip[] {
  return [
    ...getCategoryFilterChips(routeState),
    ...getLocationFilterChip(routeState),
    ...getAccessFilterChip(routeState),
    ...getDistanceFilterChip(routeState),
    ...getTimeFilterChip(routeState),
    ...getExactStartFilterChips(routeState),
    ...getSizeFilterChip(routeState),
  ];
}

function getCategoryFilterChips({
  removeCategory,
  selectedCategories,
}: ExploreRouteState): SelectedFilterChip[] {
  const chips: SelectedFilterChip[] = [];

  for (const categoryId of selectedCategories) {
    if (categoryId === "ALL") {
      continue;
    }

    chips.push({
      key: categoryId,
      label: getCategoryLabel(categoryId),
      onRemove: () => removeCategory(categoryId),
    });
  }

  return chips;
}

function getLocationFilterChip({
  locationMode,
  setLocationMode,
}: ExploreRouteState): SelectedFilterChip[] {
  if (locationMode === DEFAULT_FILTERS.locationMode) {
    return [];
  }

  return [
    {
      key: "locationMode",
      label: locationMode === "IN_PERSON" ? "Local" : "Online",
      onRemove: () => setLocationMode(DEFAULT_FILTERS.locationMode),
    },
  ];
}

function getAccessFilterChip({
  access,
  setAccess,
}: ExploreRouteState): SelectedFilterChip[] {
  if (access === DEFAULT_FILTERS.access) {
    return [];
  }

  return [
    {
      key: "access",
      label: access === "OPEN" ? "Open access" : "By request",
      onRemove: () => setAccess(DEFAULT_FILTERS.access),
    },
  ];
}

function getDistanceFilterChip({
  distance,
  locationMode,
  setDistance,
}: ExploreRouteState): SelectedFilterChip[] {
  if (distance === DEFAULT_FILTERS.distance || locationMode === "ONLINE") {
    return [];
  }

  return [
    {
      key: "distance",
      label: `Within ${distance} km`,
      onRemove: () => setDistance(DEFAULT_FILTERS.distance),
    },
  ];
}

function getTimeFilterChip({
  startsAfter,
  startsBefore,
  setTimeWindow,
  timeWindow,
}: ExploreRouteState): SelectedFilterChip[] {
  const isExactStartFiltered = Boolean(startsAfter || startsBefore);

  if (isExactStartFiltered || timeWindow === DEFAULT_FILTERS.timeWindow) {
    return [];
  }

  return [
    {
      key: "timeWindow",
      label: getTimeWindowLabel(timeWindow),
      onRemove: () => setTimeWindow(DEFAULT_FILTERS.timeWindow),
    },
  ];
}

function getExactStartFilterChips({
  setStartsAfter,
  setStartsBefore,
  startsAfter,
  startsBefore,
}: ExploreRouteState): SelectedFilterChip[] {
  const chips: SelectedFilterChip[] = [];

  if (startsAfter) {
    chips.push({
      key: "startsAfter",
      label: `From ${formatDateTimeFilter(startsAfter)}`,
      onRemove: () => setStartsAfter(DEFAULT_FILTERS.startsAfter),
    });
  }

  if (startsBefore) {
    chips.push({
      key: "startsBefore",
      label: `To ${formatDateTimeFilter(startsBefore)}`,
      onRemove: () => setStartsBefore(DEFAULT_FILTERS.startsBefore),
    });
  }

  return chips;
}

function getSizeFilterChip({
  setSizeRange,
  sizeRange,
}: ExploreRouteState): SelectedFilterChip[] {
  const isSizeFiltered =
    sizeRange[0] !== DEFAULT_FILTERS.sizeRange[0] ||
    sizeRange[1] !== DEFAULT_FILTERS.sizeRange[1];

  if (!isSizeFiltered) {
    return [];
  }

  return [
    {
      key: "sizeRange",
      label: `${sizeRange[0]}–${sizeRange[1]} people`,
      onRemove: () => setSizeRange(DEFAULT_FILTERS.sizeRange),
    },
  ];
}

function getCategoryLabel(categoryId: string) {
  const category = CATEGORIES.find((item) => item.id === categoryId);

  return category?.label || categoryId;
}

function getTimeWindowLabel(timeWindow: string) {
  switch (timeWindow) {
    case "TODAY":
      return "Today";
    case "TOMORROW":
      return "Tomorrow";
    case "THIS_WEEK":
      return "This week";
    case "THIS_WEEKEND":
      return "This weekend";
    default:
      return "Any time";
  }
}

function formatDateTimeFilter(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
