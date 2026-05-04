import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { ACCESS_FILTER_OPTIONS } from "@/features/explore/constants/explore.constants";
import { SegmentedFilterTabs } from "./segmented-filter-tabs";

export function AccessFilter() {
  const { access, setAccess } = useExploreRouteState();

  return (
    <section className="space-y-2">
      <h4 className="text-sm font-bold text-foreground tracking-tight pl-1">
        Access Mode
      </h4>
      <SegmentedFilterTabs
        options={ACCESS_FILTER_OPTIONS}
        value={access}
        onChange={setAccess}
      />
    </section>
  );
}
