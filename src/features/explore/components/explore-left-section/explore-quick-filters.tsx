import {
  Activity,
  Clock,
  MapPin,
  Monitor,
  SlidersHorizontal,
  Unlock,
  Users,
  X,
} from "lucide-react";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

const QUICK_FILTERS = [
  {
    id: "near",
    label: "Near me",
    icon: MapPin,
  },
  {
    id: "open",
    label: "Join now",
    icon: Unlock,
  },
  {
    id: "soonest",
    label: "Soonest",
    icon: Clock,
  },
  {
    id: "newest",
    label: "Newest",
    icon: Activity,
  },
  {
    id: "small",
    label: "Small groups",
    icon: Users,
  },
  {
    id: "online",
    label: "Online",
    icon: Monitor,
  },
] as const;

type QuickFilterId = (typeof QUICK_FILTERS)[number]["id"];
type ExploreRouteState = ReturnType<typeof useExploreRouteState>;
type QuickFilterState = Pick<
  ExploreRouteState,
  "access" | "distance" | "locationMode" | "sizeRange" | "sortBy"
>;
type QuickFilterActions = Pick<
  ExploreRouteState,
  "setAccess" | "setDistance" | "setLocationMode" | "setSizeRange" | "setSortBy"
>;

const QUICK_FILTER_ACTIVE_CHECKS: Record<
  QuickFilterId,
  (state: QuickFilterState) => boolean
> = {
  near: ({ distance, locationMode }) =>
    locationMode === "IN_PERSON" && distance <= 5,
  open: ({ access }) => access === "OPEN",
  soonest: ({ sortBy }) => sortBy === "SOONEST",
  newest: ({ sortBy }) => sortBy === "NEWEST",
  small: ({ sizeRange }) => isSmallGroupRange(sizeRange),
  online: ({ locationMode }) => locationMode === "ONLINE",
};

const QUICK_FILTER_TOGGLES: Record<
  QuickFilterId,
  (state: QuickFilterState, actions: QuickFilterActions) => void
> = {
  near: ({ distance, locationMode }, { setDistance, setLocationMode }) => {
    if (locationMode === "IN_PERSON" && distance <= 5) {
      setDistance(DEFAULT_FILTERS.distance);
      setLocationMode(DEFAULT_FILTERS.locationMode);
      return;
    }

    setLocationMode("IN_PERSON");
    setDistance(5);
  },
  open: ({ access }, { setAccess }) => {
    setAccess(access === "OPEN" ? DEFAULT_FILTERS.access : "OPEN");
  },
  soonest: ({ sortBy }, { setSortBy }) => {
    setSortBy(sortBy === "SOONEST" ? DEFAULT_FILTERS.sortBy : "SOONEST");
  },
  newest: ({ sortBy }, { setSortBy }) => {
    setSortBy(sortBy === "NEWEST" ? DEFAULT_FILTERS.sortBy : "NEWEST");
  },
  small: ({ sizeRange }, { setSizeRange }) => {
    setSizeRange(
      isSmallGroupRange(sizeRange) ? DEFAULT_FILTERS.sizeRange : [2, 4],
    );
  },
  online: ({ locationMode }, { setDistance, setLocationMode }) => {
    setDistance(DEFAULT_FILTERS.distance);
    setLocationMode(
      locationMode === "ONLINE" ? DEFAULT_FILTERS.locationMode : "ONLINE",
    );
  },
};

export function ExploreQuickFilters() {
  const {
    access,
    distance,
    locationMode,
    setAccess,
    setDistance,
    setLocationMode,
    setSizeRange,
    setSortBy,
    sizeRange,
    sortBy,
  } = useExploreRouteState();
  const quickFilterState: QuickFilterState = {
    access,
    distance,
    locationMode,
    sizeRange,
    sortBy,
  };
  const quickFilterActions: QuickFilterActions = {
    setAccess,
    setDistance,
    setLocationMode,
    setSizeRange,
    setSortBy,
  };

  const activeCount = getActiveQuickFilterCount(quickFilterState);

  function toggleFilter(filterId: QuickFilterId) {
    QUICK_FILTER_TOGGLES[filterId](quickFilterState, quickFilterActions);
  }

  function clearQuickFilters() {
    resetQuickFilters(quickFilterActions);
  }

  return (
    <section
      aria-labelledby="explore-quick-filters-heading"
      className="flex flex-col gap-3 px-1 py-1"
    >
      <div className="flex items-center gap-2.5">
        <IconTile icon={SlidersHorizontal} shape="square" size="md" />

        <div className="min-w-0 flex-1">
          <h2
            id="explore-quick-filters-heading"
            className="font-black text-base text-foreground leading-tight tracking-tight"
          >
            Quick filters
          </h2>
          <p className="mt-0.5 font-semibold text-muted-foreground text-xs leading-relaxed">
            Shape the list in one tap
          </p>
        </div>
      </div>

      <fieldset className="flex flex-wrap gap-1.5">
        <legend className="sr-only">Quick filters</legend>
        {QUICK_FILTERS.map((filter) => {
          const active = getIsQuickFilterActive(filter.id, quickFilterState);
          const Icon = filter.icon;

          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleFilter(filter.id)}
              className={cn(
                "inline-flex h-9 min-w-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/30 px-2.5 font-bold text-muted-foreground text-xs transition-colors",
                "hover:border-border hover:bg-muted/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40",
                active &&
                  "border-forge-teal/40 bg-forge-teal/10 text-forge-teal hover:border-forge-teal/50 hover:bg-forge-teal/12",
              )}
            >
              <Icon size={13} strokeWidth={2} aria-hidden="true" />
              <span className="min-w-0 truncate">{filter.label}</span>
            </button>
          );
        })}
      </fieldset>

      {activeCount > 0 ? (
        <Button
          type="button"
          variant="subtle"
          size="xs"
          onClick={clearQuickFilters}
          className="w-full"
        >
          <X className="size-3" aria-hidden="true" />
          Clear quick filters
        </Button>
      ) : null}
    </section>
  );
}

function getActiveQuickFilterCount(state: QuickFilterState) {
  return QUICK_FILTERS.filter((filter) =>
    getIsQuickFilterActive(filter.id, state),
  ).length;
}

function getIsQuickFilterActive(
  filterId: QuickFilterId,
  state: QuickFilterState,
) {
  return QUICK_FILTER_ACTIVE_CHECKS[filterId](state);
}

function resetQuickFilters({
  setAccess,
  setDistance,
  setLocationMode,
  setSizeRange,
  setSortBy,
}: QuickFilterActions) {
  setAccess(DEFAULT_FILTERS.access);
  setDistance(DEFAULT_FILTERS.distance);
  setLocationMode(DEFAULT_FILTERS.locationMode);
  setSizeRange(DEFAULT_FILTERS.sizeRange);
  setSortBy(DEFAULT_FILTERS.sortBy);
}

function isSmallGroupRange(sizeRange: [number, number]) {
  return sizeRange[0] === 2 && sizeRange[1] === 4;
}
