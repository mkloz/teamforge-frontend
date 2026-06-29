import type { SetActivityRouteState } from "@/features/activity/hooks/activity-route-state/activity-route-state.types";
import {
  CLEAR_ACTIVITY_SELECTION_ROUTE,
  getDensityRoutePatch,
  getFilterRoutePatch,
  getPanelRoutePatch,
  getPreferredActivityPanel,
  getSearchRoutePatch,
  getSelectionRoutePatch,
} from "@/features/activity/hooks/activity-route-state/activity-route-state-utils";
import type {
  ActivityDensity,
  ActivityFilter,
  ActivityKind,
} from "@/shared/navigation/activity-navigation";

interface UseActivityRouteActionsInput {
  isDesktop: boolean;
  isGroupDetailOpen: boolean;
  isProfilePanelOpen: boolean;
  resetSelection: () => void;
  selectConversation: (
    id: string,
    kind: ActivityKind,
    options?: { shouldOpenSidePanel?: boolean },
  ) => void;
  setActiveFilter: (filter: ActivityFilter) => void;
  setGroupDetailOpen: (open: boolean) => void;
  setProfilePanelOpen: (open: boolean) => void;
  setRouteState: SetActivityRouteState;
  setSearchQuery: (query: string) => void;
  setSidebarDensity: (density: ActivityDensity) => void;
}

export function useActivityRouteActions({
  isDesktop,
  isGroupDetailOpen,
  isProfilePanelOpen,
  resetSelection,
  selectConversation,
  setActiveFilter,
  setGroupDetailOpen,
  setProfilePanelOpen,
  setRouteState,
  setSearchQuery,
  setSidebarDensity,
}: UseActivityRouteActionsInput) {
  function updateSearchQuery(nextQuery: string) {
    setSearchQuery(nextQuery);
    void setRouteState(getSearchRoutePatch(nextQuery), {
      history: "replace",
    });
  }

  function updateFilter(nextFilter: ActivityFilter) {
    setActiveFilter(nextFilter);
    void setRouteState(getFilterRoutePatch(nextFilter), {
      history: "push",
    });
  }

  function updateDensity(nextDensity: ActivityDensity) {
    setSidebarDensity(nextDensity);
    void setRouteState(getDensityRoutePatch(nextDensity), {
      history: "replace",
    });
  }

  function selectItem(
    id: string,
    kind: ActivityKind,
    options: { messageId?: string | null } = {},
  ) {
    const nextPanel = getPreferredActivityPanel(isDesktop, kind);

    selectConversation(id, kind, {
      shouldOpenSidePanel: nextPanel !== null,
    });

    void setRouteState(
      getSelectionRoutePatch(id, kind, nextPanel, options.messageId ?? null),
      {
        history: "push",
      },
    );
  }

  function clearSelection() {
    resetSelection();
    void setRouteState(CLEAR_ACTIVITY_SELECTION_ROUTE, {
      history: "push",
    });
  }

  function toggleGroupPanel() {
    const nextOpen = !isGroupDetailOpen;
    setGroupDetailOpen(nextOpen);
    void setRouteState(getPanelRoutePatch(nextOpen ? "group" : null), {
      history: "replace",
    });
  }

  function focusGroupPlan(planId: string) {
    setGroupDetailOpen(true);
    setRouteState(
      {
        panel: "group",
        plan: planId,
        proposal: null,
      },
      {
        history: "replace",
      },
    );
  }

  function closeGroupPanel() {
    setGroupDetailOpen(false);
    void setRouteState(getPanelRoutePatch(null), {
      history: "replace",
    });
  }

  function toggleProfilePanel() {
    const nextOpen = !isProfilePanelOpen;
    setProfilePanelOpen(nextOpen);
    void setRouteState(getPanelRoutePatch(nextOpen ? "profile" : null), {
      history: "replace",
    });
  }

  function closeProfilePanel() {
    setProfilePanelOpen(false);
    void setRouteState(getPanelRoutePatch(null), {
      history: "replace",
    });
  }

  return {
    clearSelection,
    closeGroupPanel,
    closeProfilePanel,
    focusGroupPlan,
    selectItem,
    toggleGroupPanel,
    toggleProfilePanel,
    updateDensity,
    updateFilter,
    updateSearchQuery,
  };
}
