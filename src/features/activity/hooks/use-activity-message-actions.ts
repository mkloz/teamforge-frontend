import { ActivityCommands } from "@/features/activity/api/activity-commands";
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

function isMessageConversationKind(
  kind: ActivitySelectionKind | null,
): kind is "group" | "dm" {
  return kind === "group" || kind === "dm";
}

export function useActivityMessageActions() {
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const selectedId = useActivityStore((state) => state.selectedId);
  const replyingTo = useActivityStore((state) => state.replyingTo);
  const editingMessage = useActivityStore((state) => state.editingMessage);
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);
  const setEditingMessage = useActivityStore(
    (state) => state.setEditingMessage,
  );
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  function guardMessageAction(id: string, description: string) {
    return guardOfflineAction({ id, description });
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

    if (
      guardMessageAction(
        "activity-message-delete-offline",
        "Reconnect before changing messages.",
      )
    ) {
      return;
    }

    await ActivityCommands.deleteMessage(selectedKind, selectedId, message.id);

    if (replyingTo?.id === message.id) {
      setReplyingTo(null);
    }

    if (editingMessage?.id === message.id) {
      setEditingMessage(null);
    }
  }

  async function retryMessage(message: UnifiedMessage) {
    if (!isMessageConversationKind(selectedKind)) {
      return;
    }

    if (
      guardMessageAction(
        "activity-message-retry-offline",
        "Reconnect before sending messages.",
      )
    ) {
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

    if (
      guardMessageAction(
        "activity-message-reaction-offline",
        "Reconnect before reacting to messages.",
      )
    ) {
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

    if (
      guardMessageAction(
        "activity-message-pin-offline",
        "Reconnect before updating message actions.",
      )
    ) {
      return;
    }

    await ActivityCommands.pinMessage(selectedKind, selectedId, message);
  }

  async function unpinMessage(message: UnifiedMessage) {
    if (!isMessageConversationKind(selectedKind) || !canPinMessage(message)) {
      return;
    }

    if (
      guardMessageAction(
        "activity-message-unpin-offline",
        "Reconnect before updating message actions.",
      )
    ) {
      return;
    }

    await ActivityCommands.unpinMessage(selectedKind, selectedId, message);
  }

  async function toggleSaved(message: UnifiedMessage, isSaved = false) {
    if (
      !isMessageConversationKind(selectedKind) ||
      !selectedId ||
      !canSaveMessage(message)
    ) {
      return;
    }

    if (
      guardMessageAction(
        "activity-message-save-offline",
        "Reconnect before updating message actions.",
      )
    ) {
      return;
    }

    await ActivityCommands.toggleSavedMessage(
      selectedKind,
      selectedId,
      message,
      isSaved,
    );
  }

  async function forwardMessage(message: UnifiedMessage, targetChatId: string) {
    if (
      !isMessageConversationKind(selectedKind) ||
      !selectedId ||
      !canSaveMessage(message)
    ) {
      return null;
    }

    if (
      guardMessageAction(
        "activity-message-forward-offline",
        "Reconnect before forwarding messages.",
      )
    ) {
      return null;
    }

    return ActivityCommands.forwardMessage(
      selectedKind,
      selectedId,
      message,
      targetChatId,
    );
  }

  async function submitEdit(content: string) {
    if (!editingMessage || !isMessageConversationKind(selectedKind)) {
      return null;
    }

    if (
      guardMessageAction(
        "activity-message-edit-offline",
        "Reconnect before changing messages.",
      )
    ) {
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
