import { useCallback, useEffect } from "react";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { useUiStore } from "@/shared/store/ui.store";

export function useActivityPanels() {
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
    const handleResize = () => {
      setBottomNavHidden(hasSelection && window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      setBottomNavHidden(false);
    };
  }, [hasSelection, setBottomNavHidden]);

  const handleSelectItem = useCallback(
    (id: string, kind: "group" | "dm") => {
      selectConversation(id, kind);
    },
    [selectConversation],
  );

  const handleBack = useCallback(() => {
    resetSelection();
  }, [resetSelection]);

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
