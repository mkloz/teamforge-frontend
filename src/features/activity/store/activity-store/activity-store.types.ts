import type { StateCreator } from "zustand";
import type {
  ActivityParticipant,
  DirectChatsState,
  FilterChip,
  GroupsPageState,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";

export type TypingParticipant = Pick<
  ActivityParticipant,
  "id" | "name" | "avatar"
>;
export type ActivityConversationKind = "group" | "dm";
export type SidebarDensity = "default" | "compact";

export interface SelectConversationOptions {
  shouldOpenSidePanel?: boolean;
}

export interface ActivityState {
  searchQuery: string;
  activeFilter: FilterChip;
  sidebarDensity: SidebarDensity;
  selectedId: string | null;
  selectedKind: ActivityConversationKind | null;
  groups: GroupsPageState;
  direct: DirectChatsState;
  replyingTo: UnifiedMessage | null;
  editingMessage: UnifiedMessage | null;
  typingByChatId: Record<string, TypingParticipant[]>;
  pinnedConversationKeys: string[];
  savedMessagesById: Record<string, SavedMessageSnapshot>;
}

export interface ActivityActions {
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterChip) => void;
  setSidebarDensity: (density: SidebarDensity) => void;
  selectConversation: (
    id: string | null,
    kind: ActivityConversationKind | null,
    options?: SelectConversationOptions,
  ) => void;
  setReplyingTo: (message: UnifiedMessage | null) => void;
  setEditingMessage: (message: UnifiedMessage | null) => void;
  togglePinnedConversation: (
    kind: ActivityConversationKind,
    id: string,
  ) => void;
  saveMessage: (
    kind: ActivityConversationKind,
    conversationId: string,
    message: UnifiedMessage,
  ) => void;
  removeSavedMessage: (messageId: string) => void;
  toggleSavedMessage: (
    kind: ActivityConversationKind,
    conversationId: string,
    message: UnifiedMessage,
  ) => void;
  syncSavedMessage: (
    kind: ActivityConversationKind,
    conversationId: string,
    message: UnifiedMessage,
  ) => void;
  setChatTypingState: (
    chatId: string,
    participant: TypingParticipant,
    isTyping: boolean,
  ) => void;
  clearChatTypingState: (chatId: string) => void;
  toggleGroupDetail: () => void;
  setGroupDetailOpen: (open: boolean) => void;
  closeGroupDetail: () => void;
  setGroupDraft: (groupId: string, content: string) => void;
  toggleProfilePanel: () => void;
  setProfilePanelOpen: (open: boolean) => void;
  closeProfilePanel: () => void;
  setDirectDraft: (chatId: string, content: string) => void;
  resetSelection: () => void;
}

export type ActivityStore = ActivityState & ActivityActions;
export type ActivityStoreSet = Parameters<StateCreator<ActivityStore>>[0];
