import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
} from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { FilterTag } from "@/features/explore/components/filter-tag";

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
    resetFilters,
    isAnythingFiltered,
    removeCategory,
  } = useExploreRouteState();

  const filtered = isAnythingFiltered;

  if (!filtered) return null;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1"
      >
        <button
          type="button"
          onClick={resetFilters}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-micro font-bold hover:bg-primary/20 active:scale-95 transition-all duration-150"
        >
          <X className="size-3" strokeWidth={2.5} />
          Clear all
        </button>

        <div className="w-px h-4 bg-border/50 shrink-0" />

        <div className="flex items-center gap-1.5">
          <AnimatePresence mode="popLayout">
            {selectedCategories
              .filter((c) => c !== "ALL")
              .map((catId) => {
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
            {locationMode !== DEFAULT_FILTERS.locationMode && (
              <motion.div
                key="location"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <FilterTag
                  label={
                    locationMode === "IN_PERSON"
                      ? "Local"
                      : locationMode === "ONLINE"
                        ? "Online"
                        : "TBD"
                  }
                  onRemove={() => setLocationMode(DEFAULT_FILTERS.locationMode)}
                />
              </motion.div>
            )}
            {access !== DEFAULT_FILTERS.access && (
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
            {distance !== DEFAULT_FILTERS.distance &&
              locationMode !== "ONLINE" && (
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
            {(sizeRange[0] !== DEFAULT_FILTERS.sizeRange[0] ||
              sizeRange[1] !== DEFAULT_FILTERS.sizeRange[1]) && (
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
