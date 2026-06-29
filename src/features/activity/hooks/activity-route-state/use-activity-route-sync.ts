import { useEffect } from "react";

import type {
  ActivityDensity,
  ActivityFilter,
  ActivityKind,
} from "@/shared/navigation/activity-navigation";
import type {
  ResolvedActivityRouteState,
  SetActivityRouteState,
} from "./activity-route-state.types";
import { CLEAR_ACTIVITY_SELECTION_ROUTE } from "./activity-route-state-utils";

interface UseActivityRouteSyncInput {
  activeFilter: ActivityFilter;
  isGroupDetailOpen: boolean;
  isProfilePanelOpen: boolean;
  resetSelection: () => void;
  route: ResolvedActivityRouteState;
  searchQuery: string;
  selectConversation: (
    id: string,
    kind: ActivityKind,
    options?: { shouldOpenSidePanel?: boolean },
  ) => void;
  selectedId: string | null;
  selectedKind: ActivityKind | null;
  setActiveFilter: (filter: ActivityFilter) => void;
  setGroupDetailOpen: (open: boolean) => void;
  setProfilePanelOpen: (open: boolean) => void;
  setRouteState: SetActivityRouteState;
  setSearchQuery: (query: string) => void;
  setSidebarDensity: (density: ActivityDensity) => void;
  sidebarDensity: ActivityDensity;
}

export function useActivityRouteSync({
  activeFilter,
  isGroupDetailOpen,
  isProfilePanelOpen,
  resetSelection,
  route,
  searchQuery,
  selectConversation,
  selectedId,
  selectedKind,
  setActiveFilter,
  setGroupDetailOpen,
  setProfilePanelOpen,
  setRouteState,
  setSearchQuery,
  setSidebarDensity,
  sidebarDensity,
}: UseActivityRouteSyncInput) {
  useEffect(() => {
    syncRouteValue(searchQuery, route.searchQuery, setSearchQuery);
  }, [route.searchQuery, searchQuery, setSearchQuery]);

  useEffect(() => {
    syncRouteValue(activeFilter, route.filter, setActiveFilter);
  }, [activeFilter, route.filter, setActiveFilter]);

  useEffect(() => {
    syncRouteValue(sidebarDensity, route.density, setSidebarDensity);
  }, [route.density, setSidebarDensity, sidebarDensity]);

  useEffect(() => {
    syncRouteSelection({
      resetSelection,
      routeId: route.id,
      routeKind: route.kind,
      routePanel: route.panel,
      selectConversation,
      selectedId,
      selectedKind,
      setRouteState,
    });
  }, [
    resetSelection,
    route.id,
    route.kind,
    route.panel,
    selectedId,
    selectedKind,
    selectConversation,
    setRouteState,
  ]);

  useEffect(() => {
    const { shouldShowGroupPanel, shouldShowProfilePanel } =
      getRoutePanelVisibility(route.id, route.kind, route.panel);

    if (isGroupDetailOpen !== shouldShowGroupPanel) {
      setGroupDetailOpen(shouldShowGroupPanel);
    }

    if (isProfilePanelOpen !== shouldShowProfilePanel) {
      setProfilePanelOpen(shouldShowProfilePanel);
    }
  }, [
    isGroupDetailOpen,
    isProfilePanelOpen,
    route.id,
    route.kind,
    route.panel,
    setGroupDetailOpen,
    setProfilePanelOpen,
  ]);
}

function syncRouteValue<T>(
  currentValue: T,
  nextValue: T,
  setValue: (value: T) => void,
) {
  if (currentValue !== nextValue) {
    setValue(nextValue);
  }
}

function syncRouteSelection(input: {
  resetSelection: () => void;
  routeId: ResolvedActivityRouteState["id"];
  routeKind: ResolvedActivityRouteState["kind"];
  routePanel: ResolvedActivityRouteState["panel"];
  selectConversation: UseActivityRouteSyncInput["selectConversation"];
  selectedId: string | null;
  selectedKind: ActivityKind | null;
  setRouteState: SetActivityRouteState;
}) {
  if (!hasRouteSelection(input.routeId, input.routeKind)) {
    syncMissingRouteSelection(input);
    return;
  }

  syncSelectedRouteConversation(input);
}

function syncMissingRouteSelection({
  resetSelection,
  routeId,
  routeKind,
  routePanel,
  selectedId,
  selectedKind,
  setRouteState,
}: {
  resetSelection: () => void;
  routeId: ResolvedActivityRouteState["id"];
  routeKind: ResolvedActivityRouteState["kind"];
  routePanel: ResolvedActivityRouteState["panel"];
  selectedId: string | null;
  selectedKind: ActivityKind | null;
  setRouteState: SetActivityRouteState;
}) {
  if (shouldResetActivitySelection(selectedId, selectedKind)) {
    resetSelection();
  }

  if (shouldClearSelectionRoute(routeId, routeKind, routePanel)) {
    void setRouteState(CLEAR_ACTIVITY_SELECTION_ROUTE, {
      history: "replace",
    });
  }
}

function syncSelectedRouteConversation({
  routeId,
  routeKind,
  selectConversation,
  selectedId,
  selectedKind,
}: {
  routeId: ResolvedActivityRouteState["id"];
  routeKind: ResolvedActivityRouteState["kind"];
  selectConversation: UseActivityRouteSyncInput["selectConversation"];
  selectedId: string | null;
  selectedKind: ActivityKind | null;
}) {
  if (
    routeId &&
    routeKind &&
    shouldSelectRouteConversation(routeId, routeKind, selectedId, selectedKind)
  ) {
    selectConversation(routeId, routeKind, {
      shouldOpenSidePanel: false,
    });
  }
}

function hasRouteSelection(
  routeId: ResolvedActivityRouteState["id"],
  routeKind: ResolvedActivityRouteState["kind"],
) {
  return Boolean(routeKind && routeId);
}

function shouldResetActivitySelection(
  selectedId: string | null,
  selectedKind: ActivityKind | null,
) {
  return Boolean(selectedId || selectedKind);
}

function shouldClearSelectionRoute(
  routeId: ResolvedActivityRouteState["id"],
  routeKind: ResolvedActivityRouteState["kind"],
  routePanel: ResolvedActivityRouteState["panel"],
) {
  return Boolean(routeKind || routeId || routePanel);
}

function shouldSelectRouteConversation(
  routeId: string,
  routeKind: ActivityKind,
  selectedId: string | null,
  selectedKind: ActivityKind | null,
) {
  return selectedId !== routeId || selectedKind !== routeKind;
}

function getRoutePanelVisibility(
  routeId: ResolvedActivityRouteState["id"],
  routeKind: ResolvedActivityRouteState["kind"],
  routePanel: ResolvedActivityRouteState["panel"],
) {
  return {
    shouldShowGroupPanel: isGroupPanelRoute(routeId, routeKind, routePanel),
    shouldShowProfilePanel: isProfilePanelRoute(routeId, routeKind, routePanel),
  };
}

function isGroupPanelRoute(
  routeId: ResolvedActivityRouteState["id"],
  routeKind: ResolvedActivityRouteState["kind"],
  routePanel: ResolvedActivityRouteState["panel"],
) {
  return routeKind === "group" && routeId !== null && routePanel === "group";
}

function isProfilePanelRoute(
  routeId: ResolvedActivityRouteState["id"],
  routeKind: ResolvedActivityRouteState["kind"],
  routePanel: ResolvedActivityRouteState["panel"],
) {
  return routeKind === "dm" && routeId !== null && routePanel === "profile";
}
