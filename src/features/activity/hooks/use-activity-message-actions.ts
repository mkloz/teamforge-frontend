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

export function useActivityMessageActions() {
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const selectedId = useActivityStore((state) => state.selectedId);
  const replyingTo = useActivityStore((state) => state.replyingTo);
  const editingMessage = useActivityStore((state) => state.editingMessage);
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);
  const setEditingMessage = useActivityStore(
    (state) => state.setEditingMessage,
  );

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
    if (!canDeleteMessage(message)) {
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
    await ActivityCommands.retryMessage(selectedKind, selectedId, message);
  }

  async function toggleReaction(message: UnifiedMessage, emoji: string) {
    if (!canReactToMessage(message)) {
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
    if (!canPinMessage(message)) {
      return;
    }

    await ActivityCommands.pinMessage(selectedKind, selectedId, message);
  }

  async function unpinMessage(message: UnifiedMessage) {
    if (!canPinMessage(message)) {
      return;
    }

    await ActivityCommands.unpinMessage(selectedKind, selectedId, message);
  }

  async function toggleSaved(message: UnifiedMessage, isSaved = false) {
    if (!selectedKind || !selectedId || !canSaveMessage(message)) {
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
    if (!selectedKind || !selectedId || !canSaveMessage(message)) {
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
    if (!editingMessage) {
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
