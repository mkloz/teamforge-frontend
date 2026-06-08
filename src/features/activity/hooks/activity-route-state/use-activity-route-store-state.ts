import { useActivityStore } from "@/features/activity/store/activity.store";

export function useActivityRouteStoreState() {
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

  return {
    activeFilter,
    isGroupDetailOpen,
    isProfilePanelOpen,
    resetSelection,
    searchQuery,
    selectConversation,
    selectedId,
    selectedKind,
    setActiveFilter,
    setGroupDetailOpen,
    setProfilePanelOpen,
    setSearchQuery,
    setSidebarDensity,
    sidebarDensity,
  };
}
