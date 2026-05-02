import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
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
    setEditingMessage(null);
    setReplyingTo(message);
  }

  function startEdit(message: UnifiedMessage) {
    setReplyingTo(null);
    setEditingMessage(message);
  }

  function cancelEdit() {
    setEditingMessage(null);
  }

  async function deleteMessage(message: UnifiedMessage) {
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
    await ActivityCommands.toggleReaction(
      selectedKind,
      selectedId,
      message,
      emoji,
    );
  }

  async function pinMessage(message: UnifiedMessage) {
    await ActivityCommands.pinMessage(selectedKind, selectedId, message);
  }

  async function unpinMessage(message: UnifiedMessage) {
    await ActivityCommands.unpinMessage(selectedKind, selectedId, message);
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
    cancelEdit,
    deleteMessage,
    retryMessage,
    startEdit,
    startReply,
    pinMessage,
    submitEdit,
    toggleReaction,
    unpinMessage,
  };
}
