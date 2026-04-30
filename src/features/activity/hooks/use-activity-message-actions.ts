import { useCallback } from "react";

import { ActivityQueries } from "../api/activity.queries";
import type { UnifiedMessage } from "../lib/activity-contract";
import { useActivityStore } from "../store/activity.store";

export function useActivityMessageActions() {
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const selectedId = useActivityStore((state) => state.selectedId);
  const replyingTo = useActivityStore((state) => state.replyingTo);
  const editingMessage = useActivityStore((state) => state.editingMessage);
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);
  const setEditingMessage = useActivityStore(
    (state) => state.setEditingMessage,
  );

  const startReply = useCallback(
    (message: UnifiedMessage) => {
      setEditingMessage(null);
      setReplyingTo(message);
    },
    [setEditingMessage, setReplyingTo],
  );

  const startEdit = useCallback(
    (message: UnifiedMessage) => {
      setReplyingTo(null);
      setEditingMessage(message);
    },
    [setEditingMessage, setReplyingTo],
  );

  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
  }, [setEditingMessage]);

  const deleteMessage = useCallback(
    async (message: UnifiedMessage) => {
      await ActivityQueries.deleteMessage(selectedKind, selectedId, message.id);

      if (replyingTo?.id === message.id) {
        setReplyingTo(null);
      }

      if (editingMessage?.id === message.id) {
        setEditingMessage(null);
      }
    },
    [
      editingMessage?.id,
      replyingTo?.id,
      selectedId,
      selectedKind,
      setEditingMessage,
      setReplyingTo,
    ],
  );

  const retryMessage = useCallback(
    async (message: UnifiedMessage) => {
      await ActivityQueries.retryMessage(selectedKind, selectedId, message);
    },
    [selectedId, selectedKind],
  );

  const toggleReaction = useCallback(
    async (message: UnifiedMessage, emoji: string) => {
      await ActivityQueries.toggleReaction(
        selectedKind,
        selectedId,
        message,
        emoji,
      );
    },
    [selectedId, selectedKind],
  );

  const pinMessage = useCallback(
    async (message: UnifiedMessage) => {
      await ActivityQueries.pinMessage(selectedKind, selectedId, message);
    },
    [selectedId, selectedKind],
  );

  const unpinMessage = useCallback(
    async (message: UnifiedMessage) => {
      await ActivityQueries.unpinMessage(selectedKind, selectedId, message);
    },
    [selectedId, selectedKind],
  );

  const submitEdit = useCallback(
    async (content: string) => {
      if (!editingMessage) {
        return null;
      }

      const updated = await ActivityQueries.updateMessage(
        selectedKind,
        selectedId,
        editingMessage.id,
        content.trim(),
      );
      setEditingMessage(null);
      return updated;
    },
    [editingMessage, selectedId, selectedKind, setEditingMessage],
  );

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
