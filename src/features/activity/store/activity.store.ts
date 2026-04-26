import { create } from "zustand";
import type { FilterChip } from "../types/unified-conversation.types";
import type { GroupsPageState } from "../types/groups.types";
import type { DirectChatsState } from "../types/direct-chats.types";
import type { UnifiedMessage } from "../types/chat.types";

interface ActivityState {
  // Unified List UI
  searchQuery: string;
  activeFilter: FilterChip;
  sidebarDensity: "default" | "compact";

  // Selection
  selectedId: string | null;
  selectedKind: "group" | "dm" | null;

  // Feature Specific States
  groups: GroupsPageState;
  direct: DirectChatsState;

  replyingTo: UnifiedMessage | null;
  pinnedMessages: UnifiedMessage[];

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterChip) => void;
  setSidebarDensity: (density: "default" | "compact") => void;
  selectConversation: (id: string | null, kind: "group" | "dm" | null) => void;
  setReplyingTo: (message: UnifiedMessage | null) => void;
  pinMessage: (message: UnifiedMessage) => void;
  unpinMessage: (messageId: string) => void;

  // Group Actions
  toggleGroupDetail: () => void;
  closeGroupDetail: () => void;
  setGroupDraft: (groupId: string, content: string) => void;

  // Direct Action
  toggleProfilePanel: () => void;
  closeProfilePanel: () => void;
  setDirectDraft: (chatId: string, content: string) => void;

  // Reset
  resetSelection: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  searchQuery: "",
  activeFilter: "all",
  sidebarDensity: "default",
  selectedId: null,
  selectedKind: null,

  replyingTo: null,
  pinnedMessages: [],

  groups: {
    selectedGroupId: null,
    isDetailPanelOpen: false,
    searchQuery: "",
    draftMessages: {},
  },

  direct: {
    selectedChatId: null,
    isProfilePanelOpen: false,
    searchQuery: "",
    draftMessages: {},
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setSidebarDensity: (sidebarDensity) => set({ sidebarDensity }),

  selectConversation: (id, kind) =>
    set((state) => {
      const isDesktop =
        typeof window !== "undefined" && window.innerWidth >= 1024;

      return {
        selectedId: id,
        selectedKind: kind,
        groups: {
          ...state.groups,
          selectedGroupId: kind === "group" ? id : null,
          isDetailPanelOpen: kind === "group" && isDesktop,
        },
        direct: {
          ...state.direct,
          selectedChatId: kind === "dm" ? id : null,
          isProfilePanelOpen: kind === "dm" && isDesktop,
        },
      };
    }),

  toggleGroupDetail: () =>
    set((state) => ({
      groups: {
        ...state.groups,
        isDetailPanelOpen: !state.groups.isDetailPanelOpen,
      },
    })),

  closeGroupDetail: () =>
    set((state) => ({
      groups: { ...state.groups, isDetailPanelOpen: false },
    })),

  setGroupDraft: (groupId, content) =>
    set((state) => ({
      groups: {
        ...state.groups,
        draftMessages: { ...state.groups.draftMessages, [groupId]: content },
      },
    })),

  toggleProfilePanel: () =>
    set((state) => ({
      direct: {
        ...state.direct,
        isProfilePanelOpen: !state.direct.isProfilePanelOpen,
      },
    })),

  closeProfilePanel: () =>
    set((state) => ({
      direct: { ...state.direct, isProfilePanelOpen: false },
    })),

  setDirectDraft: (chatId, content) =>
    set((state) => ({
      direct: {
        ...state.direct,
        draftMessages: { ...state.direct.draftMessages, [chatId]: content },
      },
    })),

  setReplyingTo: (message) => set({ replyingTo: message }),

  pinMessage: (message) =>
    set((state) => ({
      pinnedMessages: [...state.pinnedMessages, message],
    })),

  unpinMessage: (messageId) =>
    set((state) => ({
      pinnedMessages: state.pinnedMessages.filter((m) => m.id !== messageId),
    })),

  resetSelection: () =>
    set((state) => ({
      selectedId: null,
      selectedKind: null,
      replyingTo: null,
      pinnedMessages: [],
      groups: {
        ...state.groups,
        selectedGroupId: null,
        isDetailPanelOpen: false,
      },
      direct: {
        ...state.direct,
        selectedChatId: null,
        isProfilePanelOpen: false,
      },
    })),
}));
