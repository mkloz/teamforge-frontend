import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
} from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Button } from "@/shared/components/ui/button";
import { FilterTag } from "./filter-tag";

export function SelectedFiltersBar() {
  const {
    selectedCategories,
    sizeRange,
    setSizeRange,
    distance,
    setDistance,
    locationMode,
    setLocationMode,
    access,
    setAccess,
    timeWindow,
    setTimeWindow,
    startsAfter,
    startsBefore,
    setStartsAfter,
    setStartsBefore,
    resetFilters,
    removeCategory,
  } = useExploreRouteState();

  const categoryTags = selectedCategories.filter((c) => c !== "ALL");
  const isLocationFiltered = locationMode !== DEFAULT_FILTERS.locationMode;
  const isAccessFiltered = access !== DEFAULT_FILTERS.access;
  const isExactStartFiltered = Boolean(startsAfter || startsBefore);
  const isTimeFiltered =
    !isExactStartFiltered && timeWindow !== DEFAULT_FILTERS.timeWindow;
  const isDistanceFiltered =
    distance !== DEFAULT_FILTERS.distance && locationMode !== "ONLINE";
  const isSizeFiltered =
    sizeRange[0] !== DEFAULT_FILTERS.sizeRange[0] ||
    sizeRange[1] !== DEFAULT_FILTERS.sizeRange[1];
  const filtered =
    categoryTags.length > 0 ||
    isLocationFiltered ||
    isAccessFiltered ||
    isExactStartFiltered ||
    isTimeFiltered ||
    isDistanceFiltered ||
    isSizeFiltered;

  if (!filtered) return null;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto py-1"
      >
        <Button
          type="button"
          variant="subtle"
          size="xs"
          onClick={resetFilters}
          className="h-auto shrink-0 gap-1 rounded-full px-2.5 py-1 text-micro"
        >
          <X className="size-3" strokeWidth={2.5} />
          Clear all
        </Button>

        <div className="h-4 w-px shrink-0 bg-border/50" />

        <div className="flex items-center gap-1.5 pr-1">
          <AnimatePresence mode="popLayout">
            {categoryTags.map((catId) => {
              const catInfo = CATEGORIES.find((c) => c.id === catId);
              return (
                <motion.div
                  key={catId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <FilterTag
                    label={catInfo?.label || catId}
                    onRemove={() => removeCategory(catId)}
                  />
                </motion.div>
              );
            })}
            {isLocationFiltered && (
              <motion.div
                key="location"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <FilterTag
                  label={locationMode === "IN_PERSON" ? "Local" : "Online"}
                  onRemove={() => setLocationMode(DEFAULT_FILTERS.locationMode)}
                />
              </motion.div>
            )}
            {isAccessFiltered && (
              <motion.div
                key="access"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <FilterTag
                  label={access === "OPEN" ? "Open access" : "By request"}
                  onRemove={() => setAccess(DEFAULT_FILTERS.access)}
                />
              </motion.div>
            )}
            {isDistanceFiltered && (
              <motion.div
                key="distance"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <FilterTag
                  label={`Within ${distance} km`}
                  onRemove={() => setDistance(DEFAULT_FILTERS.distance)}
                />
              </motion.div>
            )}
            {isTimeFiltered && (
              <motion.div
                key="time"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <FilterTag
                  label={getTimeWindowLabel(timeWindow)}
                  onRemove={() => setTimeWindow(DEFAULT_FILTERS.timeWindow)}
                />
              </motion.div>
            )}
            {startsAfter && (
              <motion.div
                key="starts-after"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <FilterTag
                  label={`From ${formatDateTimeFilter(startsAfter)}`}
                  onRemove={() => setStartsAfter(DEFAULT_FILTERS.startsAfter)}
                />
              </motion.div>
            )}
            {startsBefore && (
              <motion.div
                key="starts-before"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <FilterTag
                  label={`To ${formatDateTimeFilter(startsBefore)}`}
                  onRemove={() => setStartsBefore(DEFAULT_FILTERS.startsBefore)}
                />
              </motion.div>
            )}
            {isSizeFiltered && (
              <motion.div
                key="size"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <FilterTag
                  label={`${sizeRange[0]}–${sizeRange[1]} people`}
                  onRemove={() => setSizeRange(DEFAULT_FILTERS.sizeRange)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
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
