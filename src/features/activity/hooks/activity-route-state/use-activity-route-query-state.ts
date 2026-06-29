import { useQueryStates } from "nuqs";
import type { SetActivityRouteState } from "@/features/activity/hooks/activity-route-state/activity-route-state.types";
import { resolveActivityRouteState } from "@/features/activity/hooks/activity-route-state/activity-route-state-utils";
import { activityRouteParsers } from "@/shared/navigation/activity-navigation";

export function useActivityRouteQueryState() {
  const [routeState, setRouteState] = useQueryStates(activityRouteParsers, {
    history: "replace",
  });
  const setActivityRouteState: SetActivityRouteState = (state, options) =>
    setRouteState(state, options);

  return {
    route: resolveActivityRouteState(routeState),
    setRouteState: setActivityRouteState,
  };
}
