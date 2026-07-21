import { useEffect } from "react";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import type { ActivityKind } from "@/shared/navigation/activity-navigation";
import { useUiStore } from "@/shared/store/ui.store";

export function useActivityPanels() {
  const isBottomNavViewport = useMediaQuery("(max-width: 767px)");
  const isDesktopPanelViewport = useMediaQuery("(min-width: 1280px)");
  const selectedId = useActivityStore((state) => state.selectedId);
  const groups = useActivityStore((state) => state.groups);
  const direct = useActivityStore((state) => state.direct);
  const selectConversation = useActivityStore(
    (state) => state.selectConversation,
  );
  const resetSelection = useActivityStore((state) => state.resetSelection);
  const toggleGroupDetail = useActivityStore(
    (state) => state.toggleGroupDetail,
  );
  const closeGroupDetail = useActivityStore((state) => state.closeGroupDetail);
  const toggleProfilePanel = useActivityStore(
    (state) => state.toggleProfilePanel,
  );
  const closeProfilePanel = useActivityStore(
    (state) => state.closeProfilePanel,
  );
  const setBottomNavHidden = useUiStore((state) => state.setBottomNavHidden);

  const hasSelection = !!selectedId;

  useEffect(() => {
    setBottomNavHidden(hasSelection && isBottomNavViewport);

    return () => {
      setBottomNavHidden(false);
    };
  }, [hasSelection, isBottomNavViewport, setBottomNavHidden]);

  function handleSelectItem(id: string, kind: ActivityKind) {
    selectConversation(id, kind, {
      shouldOpenSidePanel: kind !== "saved" && isDesktopPanelViewport,
    });
  }

  function handleBack() {
    resetSelection();
  }

  return {
    groups,
    direct,
    hasSelection,
    handleSelectItem,
    handleBack,
    toggleGroupDetail,
    closeGroupDetail,
    toggleProfilePanel,
    closeProfilePanel,
  };
}
