import { useQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "@/shared/api/current-user-query";

import { useActivityFeed } from "./use-activity-feed";
import { useActivityPanels } from "./use-activity-panels";
import { useActivityRealtimeSync } from "./use-activity-realtime-sync";
import { useActivityRouteState } from "./use-activity-route-state";
import { useActivitySelection } from "./use-activity-selection";

export function useActivity() {
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const routeState = useActivityRouteState();
  const feed = useActivityFeed();
  const selection = useActivitySelection();
  const panels = useActivityPanels();

  useActivityRealtimeSync({
    activeChatId:
      selection.selectedKind === "group"
        ? (selection.selectedGroup?.chat?.id ?? null)
        : selection.selectedKind === "dm"
          ? (selection.selectedChat?.id ?? null)
          : null,
    activeGroupId:
      selection.selectedKind === "group"
        ? (selection.selectedGroup?.id ?? null)
        : null,
    activePlanId:
      selection.selectedKind === "group"
        ? (selection.selectedGroup?.plan?.id ?? null)
        : null,
    currentUser: currentUserQuery.data,
  });

  return {
    ...feed,
    ...selection,
    ...panels,
    ...routeState,
  };
}

export type ActivityWorkspace = ReturnType<typeof useActivity>;
