import { useActivityRouteActions } from "@/features/activity/hooks/activity-route-state/use-activity-route-actions";
import { useActivityRouteQueryState } from "@/features/activity/hooks/activity-route-state/use-activity-route-query-state";
import { useActivityRouteStoreState } from "@/features/activity/hooks/activity-route-state/use-activity-route-store-state";
import { useActivityRouteSync } from "@/features/activity/hooks/activity-route-state/use-activity-route-sync";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

export function useActivityRouteState() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const routeStore = useActivityRouteStoreState();
  const { route, setRouteState } = useActivityRouteQueryState();

  useActivityRouteSync({
    activeFilter: routeStore.activeFilter,
    isGroupDetailOpen: routeStore.isGroupDetailOpen,
    isProfilePanelOpen: routeStore.isProfilePanelOpen,
    resetSelection: routeStore.resetSelection,
    route,
    searchQuery: routeStore.searchQuery,
    selectConversation: routeStore.selectConversation,
    selectedId: routeStore.selectedId,
    selectedKind: routeStore.selectedKind,
    setActiveFilter: routeStore.setActiveFilter,
    setGroupDetailOpen: routeStore.setGroupDetailOpen,
    setProfilePanelOpen: routeStore.setProfilePanelOpen,
    setRouteState,
    setSearchQuery: routeStore.setSearchQuery,
    setSidebarDensity: routeStore.setSidebarDensity,
    sidebarDensity: routeStore.sidebarDensity,
  });

  const routeActions = useActivityRouteActions({
    isDesktop,
    isGroupDetailOpen: routeStore.isGroupDetailOpen,
    isProfilePanelOpen: routeStore.isProfilePanelOpen,
    resetSelection: routeStore.resetSelection,
    selectConversation: routeStore.selectConversation,
    setActiveFilter: routeStore.setActiveFilter,
    setGroupDetailOpen: routeStore.setGroupDetailOpen,
    setProfilePanelOpen: routeStore.setProfilePanelOpen,
    setRouteState,
    setSearchQuery: routeStore.setSearchQuery,
    setSidebarDensity: routeStore.setSidebarDensity,
  });

  return {
    searchQuery: routeStore.searchQuery,
    activeFilter: routeStore.activeFilter,
    sidebarDensity: routeStore.sidebarDensity,
    focusedPlanId: route.plan,
    focusedProposalId: route.proposal,
    focusedMessageId: route.message,
    setSearchQuery: routeActions.updateSearchQuery,
    setActiveFilter: routeActions.updateFilter,
    setSidebarDensity: routeActions.updateDensity,
    handleSelectItem: routeActions.selectItem,
    handleBack: routeActions.clearSelection,
    toggleGroupDetail: routeActions.toggleGroupPanel,
    closeGroupDetail: routeActions.closeGroupPanel,
    toggleProfilePanel: routeActions.toggleProfilePanel,
    closeProfilePanel: routeActions.closeProfilePanel,
  };
}
