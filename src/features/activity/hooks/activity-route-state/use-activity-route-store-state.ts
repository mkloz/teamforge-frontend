import {
  useActivityListControlActions,
  useActivityListDisplayState,
} from "@/features/activity/hooks/use-activity-list-store-controls";
import { useActivityStore } from "@/features/activity/store/activity.store";

export function useActivityRouteStoreState() {
  const { activeFilter, searchQuery, sidebarDensity } =
    useActivityListDisplayState();
  const selectedId = useActivityStore((state) => state.selectedId);
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const isGroupDetailOpen = useActivityStore(
    (state) => state.groups.isDetailPanelOpen,
  );
  const isProfilePanelOpen = useActivityStore(
    (state) => state.direct.isProfilePanelOpen,
  );
  const { setActiveFilter, setSearchQuery, setSidebarDensity } =
    useActivityListControlActions();
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
