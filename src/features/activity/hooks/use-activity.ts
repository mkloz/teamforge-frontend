import { useActivityComposer } from "./use-activity-composer";
import { useActivityFeed } from "./use-activity-feed";
import { useActivityPanels } from "./use-activity-panels";
import { useActivitySelection } from "./use-activity-selection";

export function useActivity() {
  const feed = useActivityFeed();
  const selection = useActivitySelection();
  const panels = useActivityPanels();
  const composer = useActivityComposer();

  return {
    ...feed,
    ...selection,
    ...panels,
    ...composer,
  };
}
