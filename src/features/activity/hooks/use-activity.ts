import { useMemo, useCallback, useEffect, useDeferredValue } from "react";
import { useActivityStore } from "../store/activity.store";
import {
  MOCK_GROUP_PREVIEWS,
  MOCK_GROUPS,
  MOCK_MESSAGES,
} from "../data/mock-groups";
import {
  MOCK_DIRECT_CHAT_PREVIEWS,
  MOCK_DIRECT_CHATS,
  MOCK_DIRECT_MESSAGES,
} from "../data/mock-direct-chats";
import {
  groupPreviewToUnified,
  dmPreviewToUnified,
  sortByRecency,
  applyFilter,
} from "../lib/unify-conversations";
import { useUiStore } from "@/shared/store/ui.store";

export function useActivity() {
  const store = useActivityStore();
  const setBottomNavHidden = useUiStore((s) => s.setBottomNavHidden);

  // ── Unified data ────────────────────────────────────────────────────────────
  const allUnified = useMemo(
    () =>
      sortByRecency([
        ...MOCK_GROUP_PREVIEWS.map(groupPreviewToUnified),
        ...MOCK_DIRECT_CHAT_PREVIEWS.map(dmPreviewToUnified),
      ]),
    [],
  );

  const deferredSearchQuery = useDeferredValue(store.searchQuery);

  const filteredItems = useMemo(
    () => applyFilter(allUnified, store.activeFilter, deferredSearchQuery),
    [allUnified, store.activeFilter, deferredSearchQuery],
  );

  // Badge counts for filter chips
  const groupCount = MOCK_GROUP_PREVIEWS.length;
  const dmCount = MOCK_DIRECT_CHAT_PREVIEWS.length;
  const unreadCount = useMemo(
    () => allUnified.filter((i) => i.unreadCount > 0).length,
    [allUnified],
  );

  // ── Derived view data ───────────────────────────────────────────────────────
  const selectedGroup = useMemo(
    () =>
      store.selectedKind === "group" && store.selectedId
        ? MOCK_GROUPS[store.selectedId]
        : null,
    [store.selectedKind, store.selectedId],
  );

  const selectedGroupMessages = useMemo(
    () =>
      store.selectedKind === "group" && store.selectedId
        ? (MOCK_MESSAGES[store.selectedId] ?? [])
        : [],
    [store.selectedKind, store.selectedId],
  );

  const selectedChat = useMemo(
    () =>
      store.selectedKind === "dm" && store.selectedId
        ? MOCK_DIRECT_CHATS[store.selectedId]
        : null,
    [store.selectedKind, store.selectedId],
  );

  const selectedDirectMessages = useMemo(
    () =>
      store.selectedKind === "dm" && store.selectedId
        ? (MOCK_DIRECT_MESSAGES[store.selectedId] ?? [])
        : [],
    [store.selectedKind, store.selectedId],
  );

  const selectedChatPreview = useMemo(
    () => MOCK_DIRECT_CHAT_PREVIEWS.find((c) => c.id === store.selectedId),
    [store.selectedId],
  );

  // ── Selection handler ───────────────────────────────────────────────────────
  const handleSelectItem = useCallback(
    (id: string, kind: "group" | "dm") => {
      store.selectConversation(id, kind);
    },
    [store],
  );

  const handleBack = useCallback(() => {
    store.resetSelection();
  }, [store]);

  // ── Bottom nav hide on mobile when viewing a conversation ──────────────────
  const hasSelection = !!store.selectedId;

  useEffect(() => {
    const handleResize = () => {
      setBottomNavHidden(hasSelection && window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      // We don't want to reset it here if we are just unmounting but still have a selection
      // However, usually we unmount when navigating away
      setBottomNavHidden(false);
    };
  }, [hasSelection, setBottomNavHidden]);

  // ── Message senders (no-op for mock) ────────────────────────────────────────
  const handleGroupSendMessage = useCallback((content: string) => {
    console.log("Mock group send:", content);
  }, []);

  const handleDirectSendMessage = useCallback((content: string) => {
    console.log("Mock direct send:", content);
  }, []);

  return {
    ...store,
    filteredItems,
    groupCount,
    dmCount,
    unreadCount,
    selectedGroup,
    selectedGroupMessages,
    selectedChat,
    selectedDirectMessages,
    selectedChatPreview,
    handleSelectItem,
    handleBack,
    handleGroupSendMessage,
    handleDirectSendMessage,
    hasSelection,
  };
}
