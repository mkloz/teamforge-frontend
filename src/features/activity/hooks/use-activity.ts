import { useActivityFeed } from "./use-activity-feed";
import { useActivityPanels } from "./use-activity-panels";
import { useActivityRouteState } from "./use-activity-route-state";
import { useActivitySelection } from "./use-activity-selection";

export function useActivity() {
  const routeState = useActivityRouteState();
  const feed = useActivityFeed();
  const selection = useActivitySelection();
  const panels = useActivityPanels();

  return {
    ...feed,
    ...selection,
    ...panels,
    ...routeState,
  };
}

export type ActivityWorkspace = ReturnType<typeof useActivity>;
