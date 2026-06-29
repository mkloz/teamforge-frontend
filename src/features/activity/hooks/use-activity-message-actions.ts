import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { useActivityComposerMessageState } from "@/features/activity/hooks/use-activity-composer-message-state";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  canDeleteMessage,
  canEditMessage,
  canPinMessage,
  canReactToMessage,
  canReplyToMessage,
  canSaveMessage,
} from "@/features/activity/lib/message-action-capabilities";
import { useActivityStore } from "@/features/activity/store/activity.store";
import type { ActivitySelectionKind } from "@/features/activity/store/activity-store/activity-store.types";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

interface MessageActionOfflineGuard {
  description: string;
  id: string;
}

interface SelectedMessageConversation {
  id: string;
  kind: "group" | "dm";
}

const MESSAGE_ACTION_OFFLINE_GUARDS = {
  delete: {
    id: "activity-message-delete-offline",
    description: "Reconnect before changing messages.",
  },
  edit: {
    id: "activity-message-edit-offline",
    description: "Reconnect before changing messages.",
  },
  forward: {
    id: "activity-message-forward-offline",
    description: "Reconnect before forwarding messages.",
  },
  pin: {
    id: "activity-message-pin-offline",
    description: "Reconnect before updating message actions.",
  },
  reaction: {
    id: "activity-message-reaction-offline",
    description: "Reconnect before reacting to messages.",
  },
  retry: {
    id: "activity-message-retry-offline",
    description: "Reconnect before sending messages.",
  },
  save: {
    id: "activity-message-save-offline",
    description: "Reconnect before updating message actions.",
  },
  unpin: {
    id: "activity-message-unpin-offline",
    description: "Reconnect before updating message actions.",
  },
} as const satisfies Record<string, MessageActionOfflineGuard>;

function isMessageConversationKind(
  kind: ActivitySelectionKind | null,
): kind is "group" | "dm" {
  return kind === "group" || kind === "dm";
}

function clearComposerReference(
  message: UnifiedMessage | null,
  messageId: string,
  clearMessage: (message: UnifiedMessage | null) => void,
) {
  if (message?.id === messageId) {
    clearMessage(null);
  }
}

export function useActivityMessageActions() {
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const selectedId = useActivityStore((state) => state.selectedId);
  const { editingMessage, replyingTo, setEditingMessage, setReplyingTo } =
    useActivityComposerMessageState();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  function guardMessageAction(guard: MessageActionOfflineGuard) {
    return guardOfflineAction(guard);
  }

  function getSelectedMessageConversation(): SelectedMessageConversation | null {
    if (!isMessageConversationKind(selectedKind) || !selectedId) {
      return null;
    }

    return {
      id: selectedId,
      kind: selectedKind,
    };
  }

  function startReply(message: UnifiedMessage) {
    if (!canReplyToMessage(message)) {
      return;
    }

    setEditingMessage(null);
    setReplyingTo(message);
  }

  function startEdit(message: UnifiedMessage) {
    if (!canEditMessage(message)) {
      return;
    }

    setReplyingTo(null);
    setEditingMessage(message);
  }

  function cancelEdit() {
    setEditingMessage(null);
  }

  async function deleteMessage(message: UnifiedMessage) {
    if (
      !isMessageConversationKind(selectedKind) ||
      !canDeleteMessage(message)
    ) {
      return;
    }

    if (guardMessageAction(MESSAGE_ACTION_OFFLINE_GUARDS.delete)) {
      return;
    }

    await ActivityCommands.deleteMessage(selectedKind, selectedId, message.id);
    clearComposerReferencesForMessage(message.id);
  }

  function clearComposerReferencesForMessage(messageId: string) {
    clearComposerReference(replyingTo, messageId, setReplyingTo);
    clearComposerReference(editingMessage, messageId, setEditingMessage);
  }

  async function retryMessage(message: UnifiedMessage) {
    if (!isMessageConversationKind(selectedKind)) {
      return;
    }

    if (guardMessageAction(MESSAGE_ACTION_OFFLINE_GUARDS.retry)) {
      return;
    }

    await ActivityCommands.retryMessage(selectedKind, selectedId, message);
  }

  async function toggleReaction(message: UnifiedMessage, emoji: string) {
    if (
      !isMessageConversationKind(selectedKind) ||
      !canReactToMessage(message)
    ) {
      return;
    }

    if (guardMessageAction(MESSAGE_ACTION_OFFLINE_GUARDS.reaction)) {
      return;
    }

    await ActivityCommands.toggleReaction(
      selectedKind,
      selectedId,
      message,
      emoji,
    );
  }

  async function pinMessage(message: UnifiedMessage) {
    if (!isMessageConversationKind(selectedKind) || !canPinMessage(message)) {
      return;
    }

    if (guardMessageAction(MESSAGE_ACTION_OFFLINE_GUARDS.pin)) {
      return;
    }

    await ActivityCommands.pinMessage(selectedKind, selectedId, message);
  }

  async function unpinMessage(message: UnifiedMessage) {
    if (!isMessageConversationKind(selectedKind) || !canPinMessage(message)) {
      return;
    }

    if (guardMessageAction(MESSAGE_ACTION_OFFLINE_GUARDS.unpin)) {
      return;
    }

    await ActivityCommands.unpinMessage(selectedKind, selectedId, message);
  }

  async function toggleSaved(message: UnifiedMessage, isSaved = false) {
    const conversation = getSelectedMessageConversation();

    if (!conversation || !canSaveMessage(message)) {
      return;
    }

    if (guardMessageAction(MESSAGE_ACTION_OFFLINE_GUARDS.save)) {
      return;
    }

    await ActivityCommands.toggleSavedMessage(
      conversation.kind,
      conversation.id,
      message,
      isSaved,
    );
  }

  async function forwardMessage(message: UnifiedMessage, targetChatId: string) {
    const conversation = getSelectedMessageConversation();

    if (!conversation || !canSaveMessage(message)) {
      return null;
    }

    if (guardMessageAction(MESSAGE_ACTION_OFFLINE_GUARDS.forward)) {
      return null;
    }

    return ActivityCommands.forwardMessage(
      conversation.kind,
      conversation.id,
      message,
      targetChatId,
    );
  }

  async function submitEdit(content: string) {
    if (!editingMessage || !isMessageConversationKind(selectedKind)) {
      return null;
    }

    if (guardMessageAction(MESSAGE_ACTION_OFFLINE_GUARDS.edit)) {
      return null;
    }

    const updated = await ActivityCommands.updateMessage(
      selectedKind,
      selectedId,
      editingMessage.id,
      content.trim(),
    );
    setEditingMessage(null);
    return updated;
  }

  return {
    editingMessage,
    isOnline,
    replyingTo,
    cancelEdit,
    deleteMessage,
    retryMessage,
    startEdit,
    startReply,
    forwardMessage,
    pinMessage,
    submitEdit,
    toggleReaction,
    toggleSaved,
    unpinMessage,
  };
}
