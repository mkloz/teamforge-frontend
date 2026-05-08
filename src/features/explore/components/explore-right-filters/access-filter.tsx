import { ACCESS_FILTER_OPTIONS } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { SegmentedFilterTabs } from "./segmented-filter-tabs";

export function AccessFilter() {
  const { access, setAccess } = useExploreRouteState();

  return (
    <section className="space-y-2">
      <h4 className="pl-1 text-sm font-bold tracking-tight text-foreground">
        Join flow
      </h4>
      <SegmentedFilterTabs
        options={ACCESS_FILTER_OPTIONS}
        value={access}
        onChange={setAccess}
      />
    </section>
  );
}
