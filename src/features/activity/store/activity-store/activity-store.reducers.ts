import type {
  ActivityConversationKind,
  ActivityState,
  SelectConversationOptions,
  TypingParticipant,
} from "@/features/activity/store/activity-store/activity-store.types";

export function selectConversationState(
  state: ActivityState,
  id: string | null,
  kind: ActivityConversationKind | null,
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
