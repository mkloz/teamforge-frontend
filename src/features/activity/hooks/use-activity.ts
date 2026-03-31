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
  groupMessageToUnified,
  dmMessageToUnified,
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

  const selectedGroupMessages = useMemo(() => {
    if (store.selectedKind === "group" && store.selectedId) {
      const msgs = MOCK_MESSAGES[store.selectedId] ?? [];
      return msgs.map(groupMessageToUnified);
    }
    return [];
  }, [store.selectedKind, store.selectedId]);

  const selectedChat = useMemo(
    () =>
      store.selectedKind === "dm" && store.selectedId
        ? MOCK_DIRECT_CHATS[store.selectedId]
        : null,
    [store.selectedKind, store.selectedId],
  );

  const selectedDirectMessages = useMemo(() => {
    if (store.selectedKind === "dm" && store.selectedId && selectedChat) {
      const msgs = MOCK_DIRECT_MESSAGES[store.selectedId] ?? [];
      return msgs.map((m) =>
        dmMessageToUnified(
          m,
          selectedChat.participant.name,
          selectedChat.participant.avatar,
        ),
      );
    }
    return [];
  }, [store.selectedKind, store.selectedId, selectedChat]);

  const selectedChatPreview = useMemo(
    () => MOCK_DIRECT_CHAT_PREVIEWS.find((c) => c.id === store.selectedId),
    [store.selectedId],
  );

  // Unified typing list for groups (mocked based on plan status)
  const typingUsers = useMemo(() => {
    if (
      store.selectedKind === "group" &&
      selectedGroup?.plan.status === "DRAFT"
    ) {
      return [{ name: "Jordan", avatar: selectedGroup.members[0]?.avatar }];
    }
    return [];
  }, [store.selectedKind, selectedGroup]);

  const isTyping = selectedChatPreview?.isTyping ?? false;

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
      setBottomNavHidden(false);
    };
  }, [hasSelection, setBottomNavHidden]);

  // ── Message senders (no-op for mock) ────────────────────────────────────────
  const handleSendMessage = useCallback(
    (content: string) => {
      console.log(`Mock ${store.selectedKind} send:`, content);
    },
    [store.selectedKind],
  );

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
    isTyping,
    typingUsers,
    handleSelectItem,
    handleBack,
    handleSendMessage,
    hasSelection,
  };
}
