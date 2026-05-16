import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import type {
  ActivityConversationKind,
  ActivitySelectionKind,
  ActivityState,
  SelectConversationOptions,
  TypingParticipant,
} from "@/features/activity/store/activity-store/activity-store.types";

export function selectConversationState(
  state: ActivityState,
  id: string | null,
  kind: ActivitySelectionKind | null,
  options: SelectConversationOptions = {},
): Pick<ActivityState, "selectedId" | "selectedKind" | "groups" | "direct"> {
  const shouldOpenSidePanel = options.shouldOpenSidePanel ?? false;

  return {
    selectedId: id,
    selectedKind: kind,
    groups: {
      ...state.groups,
      selectedGroupId: kind === "group" ? id : null,
      isDetailPanelOpen: kind === "group" && shouldOpenSidePanel,
    },
    direct: {
      ...state.direct,
      selectedChatId: kind === "dm" ? id : null,
      isProfilePanelOpen: kind === "dm" && shouldOpenSidePanel,
    },
  };
}

export function setGroupDetailOpenState(
  state: ActivityState,
  isDetailPanelOpen: boolean,
): Pick<ActivityState, "groups"> {
  return {
    groups: {
      ...state.groups,
      isDetailPanelOpen,
    },
  };
}

export function setGroupDraftState(
  state: ActivityState,
  groupId: string,
  content: string,
): Pick<ActivityState, "groups"> {
  return {
    groups: {
      ...state.groups,
      draftMessages: {
        ...state.groups.draftMessages,
        [groupId]: content,
      },
    },
  };
}

export function setProfilePanelOpenState(
  state: ActivityState,
  isProfilePanelOpen: boolean,
): Pick<ActivityState, "direct"> {
  return {
    direct: {
      ...state.direct,
      isProfilePanelOpen,
    },
  };
}

export function setDirectDraftState(
  state: ActivityState,
  chatId: string,
  content: string,
): Pick<ActivityState, "direct"> {
  return {
    direct: {
      ...state.direct,
      draftMessages: {
        ...state.direct.draftMessages,
        [chatId]: content,
      },
    },
  };
}

export function togglePinnedConversationState(
  state: ActivityState,
  kind: ActivityConversationKind,
  id: string,
): Pick<ActivityState, "pinnedConversationKeys"> {
  const key = getActivityConversationKey(kind, id);
  const isPinned = state.pinnedConversationKeys.includes(key);

  return {
    pinnedConversationKeys: isPinned
      ? state.pinnedConversationKeys.filter((item) => item !== key)
      : [key, ...state.pinnedConversationKeys],
  };
}

export function saveMessageState(
  state: ActivityState,
  kind: ActivityConversationKind,
  conversationId: string,
  message: UnifiedMessage,
): Pick<ActivityState, "savedMessagesById"> {
  return {
    savedMessagesById: {
      ...state.savedMessagesById,
      [message.id]: {
        conversationId,
        conversationKind: kind,
        message,
        savedAt:
          state.savedMessagesById[message.id]?.savedAt ??
          new Date().toISOString(),
      },
    },
  };
}

export function removeSavedMessageState(
  state: ActivityState,
  messageId: string,
): Pick<ActivityState, "savedMessagesById"> {
  const { [messageId]: _removed, ...rest } = state.savedMessagesById;
  void _removed;

  return {
    savedMessagesById: rest,
  };
}

export function toggleSavedMessageState(
  state: ActivityState,
  kind: ActivityConversationKind,
  conversationId: string,
  message: UnifiedMessage,
): Pick<ActivityState, "savedMessagesById"> {
  if (state.savedMessagesById[message.id]) {
    return removeSavedMessageState(state, message.id);
  }

  return saveMessageState(state, kind, conversationId, message);
}

export function syncSavedMessageState(
  state: ActivityState,
  kind: ActivityConversationKind,
  conversationId: string,
  message: UnifiedMessage,
): Pick<ActivityState, "savedMessagesById"> {
  const current = state.savedMessagesById[message.id];

  if (!current) {
    return {
      savedMessagesById: state.savedMessagesById,
    };
  }

  const snapshot: SavedMessageSnapshot = {
    ...current,
    conversationId,
    conversationKind: kind,
    message,
  };

  return {
    savedMessagesById: {
      ...state.savedMessagesById,
      [message.id]: snapshot,
    },
  };
}

function getNextTypingParticipants(
  current: TypingParticipant[],
  participant: TypingParticipant,
  isTyping: boolean,
) {
  if (!isTyping) {
    return current.filter((item) => item.id !== participant.id);
  }

  return current.some((item) => item.id === participant.id)
    ? current
    : [...current, participant];
}

export function setChatTypingState(
  state: ActivityState,
  chatId: string,
  participant: TypingParticipant,
  isTyping: boolean,
): Pick<ActivityState, "typingByChatId"> {
  return {
    typingByChatId: {
      ...state.typingByChatId,
      [chatId]: getNextTypingParticipants(
        state.typingByChatId[chatId] ?? [],
        participant,
        isTyping,
      ),
    },
  };
}

export function clearChatTypingState(
  state: ActivityState,
  chatId: string,
): Pick<ActivityState, "typingByChatId"> {
  return {
    typingByChatId: {
      ...state.typingByChatId,
      [chatId]: [],
    },
  };
}

export function resetSelectionState(
  state: ActivityState,
): Pick<
  ActivityState,
  | "selectedId"
  | "selectedKind"
  | "replyingTo"
  | "editingMessage"
  | "typingByChatId"
  | "groups"
  | "direct"
> {
  return {
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
  };
}
