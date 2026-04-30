import { create } from "zustand";
import type {
  ActivityParticipant,
  DirectChatsState,
  FilterChip,
  GroupsPageState,
  UnifiedMessage,
} from "../lib/activity-contract";

type TypingParticipant = Pick<ActivityParticipant, "id" | "name" | "avatar">;

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
  editingMessage: UnifiedMessage | null;
  typingByChatId: Record<string, TypingParticipant[]>;

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterChip) => void;
  setSidebarDensity: (density: "default" | "compact") => void;
  selectConversation: (id: string | null, kind: "group" | "dm" | null) => void;
  setReplyingTo: (message: UnifiedMessage | null) => void;
  setEditingMessage: (message: UnifiedMessage | null) => void;
  setChatTypingState: (
    chatId: string,
    participant: TypingParticipant,
    isTyping: boolean,
  ) => void;
  clearChatTypingState: (chatId: string) => void;

  // Group Actions
  toggleGroupDetail: () => void;
  setGroupDetailOpen: (open: boolean) => void;
  closeGroupDetail: () => void;
  setGroupDraft: (groupId: string, content: string) => void;

  // Direct Action
  toggleProfilePanel: () => void;
  setProfilePanelOpen: (open: boolean) => void;
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
  editingMessage: null,
  typingByChatId: {},

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

  setGroupDetailOpen: (open) =>
    set((state) => ({
      groups: {
        ...state.groups,
        isDetailPanelOpen: open,
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

  setProfilePanelOpen: (open) =>
    set((state) => ({
      direct: {
        ...state.direct,
        isProfilePanelOpen: open,
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
  setEditingMessage: (message) => set({ editingMessage: message }),
  setChatTypingState: (chatId, participant, isTyping) =>
    set((state) => {
      const current = state.typingByChatId[chatId] ?? [];
      const next = isTyping
        ? current.some((item) => item.id === participant.id)
          ? current
          : [...current, participant]
        : current.filter((item) => item.id !== participant.id);

      return {
        typingByChatId: {
          ...state.typingByChatId,
          [chatId]: next,
        },
      };
    }),
  clearChatTypingState: (chatId) =>
    set((state) => ({
      typingByChatId: {
        ...state.typingByChatId,
        [chatId]: [],
      },
    })),

  resetSelection: () =>
    set((state) => ({
      selectedId: null,
      selectedKind: null,
      replyingTo: null,
      editingMessage: null,
      typingByChatId: {},
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
