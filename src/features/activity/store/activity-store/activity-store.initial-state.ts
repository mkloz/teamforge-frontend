import type { ActivityState } from "@/features/activity/store/activity-store/activity-store.types";

export const initialActivityState: ActivityState = {
  searchQuery: "",
  activeFilter: "all",
  sidebarDensity: "default",
  selectedId: null,
  selectedKind: null,
  replyingTo: null,
  editingMessage: null,
  typingByChatId: {},
  pinnedConversationKeys: [],
  savedMessagesById: {},
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
};
