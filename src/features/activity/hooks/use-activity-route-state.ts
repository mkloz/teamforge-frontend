import { useEffect } from "react";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import { useMediaQuery } from "@/shared/hooks/use-media-query";
import {
  activityDensityValues,
  activityFilterValues,
  activityKindValues,
  activityPanelValues,
} from "@/shared/lib/activity-route";

import { useActivityStore } from "@/features/activity/store/activity.store";

export function useActivityRouteState() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const searchQuery = useActivityStore((state) => state.searchQuery);
  const activeFilter = useActivityStore((state) => state.activeFilter);
  const sidebarDensity = useActivityStore((state) => state.sidebarDensity);
  const selectedId = useActivityStore((state) => state.selectedId);
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const isGroupDetailOpen = useActivityStore(
    (state) => state.groups.isDetailPanelOpen,
  );
  const isProfilePanelOpen = useActivityStore(
    (state) => state.direct.isProfilePanelOpen,
  );
  const setSearchQuery = useActivityStore((state) => state.setSearchQuery);
  const setActiveFilter = useActivityStore((state) => state.setActiveFilter);
  const setSidebarDensity = useActivityStore(
    (state) => state.setSidebarDensity,
  );
  const selectConversation = useActivityStore(
    (state) => state.selectConversation,
  );
  const resetSelection = useActivityStore((state) => state.resetSelection);
  const setGroupDetailOpen = useActivityStore(
    (state) => state.setGroupDetailOpen,
  );
  const setProfilePanelOpen = useActivityStore(
    (state) => state.setProfilePanelOpen,
  );

  const [routeState, setRouteState] = useQueryStates(
    {
      q: parseAsString,
      filter: parseAsStringLiteral(activityFilterValues),
      density: parseAsStringLiteral(activityDensityValues),
      kind: parseAsStringLiteral(activityKindValues),
      id: parseAsString,
      panel: parseAsStringLiteral(activityPanelValues),
      plan: parseAsString,
      proposal: parseAsString,
      message: parseAsString,
    },
    {
      history: "replace",
    },
  );

  const routeSearchQuery = routeState.q ?? "";
  const routeFilter = routeState.filter ?? "all";
  const routeDensity = routeState.density ?? "default";
  const routeKind = routeState.kind ?? null;
  const routeId = routeState.id ?? null;
  const routePanel = routeState.panel ?? null;
  const routePlan = routeState.plan ?? null;
  const routeProposal = routeState.proposal ?? null;
  const routeMessage = routeState.message ?? null;

  useEffect(() => {
    if (searchQuery !== routeSearchQuery) {
      setSearchQuery(routeSearchQuery);
    }
  }, [routeSearchQuery, searchQuery, setSearchQuery]);

  useEffect(() => {
    if (activeFilter !== routeFilter) {
      setActiveFilter(routeFilter);
    }
  }, [activeFilter, routeFilter, setActiveFilter]);

  useEffect(() => {
    if (sidebarDensity !== routeDensity) {
      setSidebarDensity(routeDensity);
    }
  }, [routeDensity, setSidebarDensity, sidebarDensity]);

  useEffect(() => {
    if (!routeKind || !routeId) {
      if (selectedId || selectedKind) {
        resetSelection();
      }

      if (routeKind || routeId || routePanel) {
        void setRouteState(
          {
            kind: null,
            id: null,
            panel: null,
            plan: null,
            proposal: null,
            message: null,
          },
          { history: "replace" },
        );
      }

      return;
    }

    if (selectedId !== routeId || selectedKind !== routeKind) {
      selectConversation(routeId, routeKind);
    }
  }, [
    resetSelection,
    routeId,
    routeKind,
    routePanel,
    selectedId,
    selectedKind,
    selectConversation,
    setRouteState,
  ]);

  useEffect(() => {
    const shouldShowGroupPanel =
      routeKind === "group" && routeId !== null && routePanel === "group";
    const shouldShowProfilePanel =
      routeKind === "dm" && routeId !== null && routePanel === "profile";

    if (isGroupDetailOpen !== shouldShowGroupPanel) {
      setGroupDetailOpen(shouldShowGroupPanel);
    }

    if (isProfilePanelOpen !== shouldShowProfilePanel) {
      setProfilePanelOpen(shouldShowProfilePanel);
    }
  }, [
    isGroupDetailOpen,
    isProfilePanelOpen,
    routeId,
    routeKind,
    routePanel,
    setGroupDetailOpen,
    setProfilePanelOpen,
  ]);

  function updateSearchQuery(nextQuery: string) {
    setSearchQuery(nextQuery);
    void setRouteState(
      {
        q: nextQuery.trim() ? nextQuery : null,
      },
      { history: "replace" },
    );
  }

  function updateFilter(nextFilter: (typeof activityFilterValues)[number]) {
    setActiveFilter(nextFilter);
    void setRouteState(
      {
        filter: nextFilter === "all" ? null : nextFilter,
      },
      { history: "push" },
    );
  }

  function updateDensity(nextDensity: (typeof activityDensityValues)[number]) {
    setSidebarDensity(nextDensity);
    void setRouteState(
      {
        density: nextDensity === "default" ? null : nextDensity,
      },
      { history: "replace" },
    );
  }

  function selectItem(id: string, kind: (typeof activityKindValues)[number]) {
    const nextPanel =
      isDesktop && kind === "group"
        ? "group"
        : isDesktop && kind === "dm"
          ? "profile"
          : null;

    selectConversation(id, kind);
    if (kind === "group") {
      setGroupDetailOpen(nextPanel === "group");
      setProfilePanelOpen(false);
    } else {
      setProfilePanelOpen(nextPanel === "profile");
      setGroupDetailOpen(false);
    }

    void setRouteState(
      {
        kind,
        id,
        panel: nextPanel,
        plan: null,
        proposal: null,
        message: null,
      },
      { history: "push" },
    );
  }

  function clearSelection() {
    resetSelection();
    void setRouteState(
      {
        kind: null,
        id: null,
        panel: null,
        plan: null,
        proposal: null,
        message: null,
      },
      { history: "push" },
    );
  }

  function toggleGroupPanel() {
    const nextOpen = !isGroupDetailOpen;
    setGroupDetailOpen(nextOpen);
    void setRouteState(
      {
        panel: nextOpen ? "group" : null,
      },
      { history: "replace" },
    );
  }

  function closeGroupPanel() {
    setGroupDetailOpen(false);
    void setRouteState(
      {
        panel: null,
      },
      { history: "replace" },
    );
  }

  function toggleProfilePanel() {
    const nextOpen = !isProfilePanelOpen;
    setProfilePanelOpen(nextOpen);
    void setRouteState(
      {
        panel: nextOpen ? "profile" : null,
      },
      { history: "replace" },
    );
  }

  function closeProfilePanel() {
    setProfilePanelOpen(false);
    void setRouteState(
      {
        panel: null,
      },
      { history: "replace" },
    );
  }

  return {
    searchQuery,
    activeFilter,
    sidebarDensity,
    focusedPlanId: routePlan,
    focusedProposalId: routeProposal,
    focusedMessageId: routeMessage,
    setSearchQuery: updateSearchQuery,
    setActiveFilter: updateFilter,
    setSidebarDensity: updateDensity,
    handleSelectItem: selectItem,
    handleBack: clearSelection,
    toggleGroupDetail: toggleGroupPanel,
    closeGroupDetail: closeGroupPanel,
    toggleProfilePanel,
    closeProfilePanel,
  };
}
