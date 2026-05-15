import { ACCESS_FILTER_OPTIONS } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { SegmentedFilterTabs } from "./segmented-filter-tabs";

export function AccessFilter() {
  const { access, setAccess } = useExploreRouteState();

  return (
    <section className="flex flex-col gap-2">
      <h4 className="pl-1 font-bold text-foreground text-sm tracking-tight">
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
