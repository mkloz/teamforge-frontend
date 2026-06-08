import {
  clearChatTypingState,
  removeSavedMessageState,
  resetSelectionState,
  saveMessageState,
  selectConversationState,
  setChatTypingState,
  setDirectDraftState,
  setGroupDetailOpenState,
  setGroupDraftState,
  setProfilePanelOpenState,
  syncSavedMessageState,
  togglePinnedConversationState,
  toggleSavedMessageState,
} from "@/features/activity/store/activity-store/activity-store.reducers";
import type {
  ActivityActions,
  ActivityStoreSet,
} from "@/features/activity/store/activity-store/activity-store.types";

export function createActivityStoreActions(
  set: ActivityStoreSet,
): ActivityActions {
  return {
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setActiveFilter: (activeFilter) => set({ activeFilter }),
    setSidebarDensity: (sidebarDensity) => set({ sidebarDensity }),
    selectConversation: (id, kind, options) =>
      set((state) => selectConversationState(state, id, kind, options)),
    setReplyingTo: (replyingTo) => set({ replyingTo }),
    setEditingMessage: (editingMessage) => set({ editingMessage }),
    togglePinnedConversation: (kind, id) =>
      set((state) => togglePinnedConversationState(state, kind, id)),
    saveMessage: (kind, conversationId, message) =>
      set((state) => saveMessageState(state, kind, conversationId, message)),
    removeSavedMessage: (messageId) =>
      set((state) => removeSavedMessageState(state, messageId)),
    toggleSavedMessage: (kind, conversationId, message) =>
      set((state) =>
        toggleSavedMessageState(state, kind, conversationId, message),
      ),
    syncSavedMessage: (kind, conversationId, message) =>
      set((state) =>
        syncSavedMessageState(state, kind, conversationId, message),
      ),
    setChatTypingState: (chatId, participant, isTyping) =>
      set((state) => setChatTypingState(state, chatId, participant, isTyping)),
    clearChatTypingState: (chatId) =>
      set((state) => clearChatTypingState(state, chatId)),
    toggleGroupDetail: () =>
      set((state) =>
        setGroupDetailOpenState(state, !state.groups.isDetailPanelOpen),
      ),
    setGroupDetailOpen: (open) =>
      set((state) => setGroupDetailOpenState(state, open)),
    closeGroupDetail: () =>
      set((state) => setGroupDetailOpenState(state, false)),
    setGroupDraft: (groupId, content) =>
      set((state) => setGroupDraftState(state, groupId, content)),
    toggleProfilePanel: () =>
      set((state) =>
        setProfilePanelOpenState(state, !state.direct.isProfilePanelOpen),
      ),
    setProfilePanelOpen: (open) =>
      set((state) => setProfilePanelOpenState(state, open)),
    closeProfilePanel: () =>
      set((state) => setProfilePanelOpenState(state, false)),
    setDirectDraft: (chatId, content) =>
      set((state) => setDirectDraftState(state, chatId, content)),
    resetSelection: () => set((state) => resetSelectionState(state)),
  };
}
