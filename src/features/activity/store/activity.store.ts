import { create } from "zustand";
import type { FilterChip } from "../types/unified-conversation.types";
import type { GroupsPageState } from "../types/groups.types";
import type { DirectChatsState } from "../types/direct-chats.types";

interface ActivityState {
  // Unified List UI
  searchQuery: string;
  activeFilter: FilterChip;

  // Selection
  selectedId: string | null;
  selectedKind: "group" | "dm" | null;

  // Feature Specific States
  groups: GroupsPageState;
  direct: DirectChatsState;

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterChip) => void;
  selectConversation: (id: string | null, kind: "group" | "dm" | null) => void;

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
  selectedId: null,
  selectedKind: null,

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

  selectConversation: (id, kind) =>
    set((state) => ({
      selectedId: id,
      selectedKind: kind,
      groups: {
        ...state.groups,
        selectedGroupId: kind === "group" ? id : null,
        // Auto-open detail panel on large screens when selecting a group
        isDetailPanelOpen:
          kind === "group" &&
          typeof window !== "undefined" &&
          window.innerWidth >= 1024,
      },
      direct: {
        ...state.direct,
        selectedChatId: kind === "dm" ? id : null,
        isProfilePanelOpen: false,
      },
    })),

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

  resetSelection: () =>
    set((state) => ({
      selectedId: null,
      selectedKind: null,
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
