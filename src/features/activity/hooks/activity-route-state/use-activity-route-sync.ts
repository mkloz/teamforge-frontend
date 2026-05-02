import { useEffect } from "react";

import type {
  ActivityDensity,
  ActivityFilter,
  ActivityKind,
} from "@/features/activity/lib/activity-route";

import { CLEAR_ACTIVITY_SELECTION_ROUTE } from "./activity-route-state-utils";
import type {
  ResolvedActivityRouteState,
  SetActivityRouteState,
} from "./activity-route-state.types";

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
    if (searchQuery !== route.searchQuery) {
      setSearchQuery(route.searchQuery);
    }
  }, [route.searchQuery, searchQuery, setSearchQuery]);

  useEffect(() => {
    if (activeFilter !== route.filter) {
      setActiveFilter(route.filter);
    }
  }, [activeFilter, route.filter, setActiveFilter]);

  useEffect(() => {
    if (sidebarDensity !== route.density) {
      setSidebarDensity(route.density);
    }
  }, [route.density, setSidebarDensity, sidebarDensity]);

  useEffect(() => {
    if (!route.kind || !route.id) {
      if (selectedId || selectedKind) {
        resetSelection();
      }

      if (route.kind || route.id || route.panel) {
        void setRouteState(CLEAR_ACTIVITY_SELECTION_ROUTE, {
          history: "replace",
        });
      }

      return;
    }

    if (selectedId !== route.id || selectedKind !== route.kind) {
      selectConversation(route.id, route.kind, {
        shouldOpenSidePanel: false,
      });
    }
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
    const shouldShowGroupPanel =
      route.kind === "group" && route.id !== null && route.panel === "group";
    const shouldShowProfilePanel =
      route.kind === "dm" && route.id !== null && route.panel === "profile";

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
