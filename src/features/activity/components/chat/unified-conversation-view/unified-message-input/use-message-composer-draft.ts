import { useEffect, useEffectEvent, useRef, useState } from "react";

import { useActivityStore } from "@/features/activity/store/activity.store";

interface UseMessageComposerDraftOptions {
  errorMessage: string | null;
  onClearAttachments: () => void;
  onClearError?: () => void;
}

export function useMessageComposerDraft({
  errorMessage,
  onClearAttachments,
  onClearError,
}: UseMessageComposerDraftOptions) {
  const [draftValue, setDraftValue] = useState({
    editingMessageId: null as string | null,
    value: "",
  });
  const previousEditingMessageIdRef = useRef<string | null>(null);

  const replyingTo = useActivityStore((state) => state.replyingTo);
  const editingMessage = useActivityStore((state) => state.editingMessage);
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);
  const setEditingMessage = useActivityStore(
    (state) => state.setEditingMessage,
  );

  const editingMessageId = editingMessage?.id ?? null;
  const value = editingMessage
    ? draftValue.editingMessageId === editingMessage.id
      ? draftValue.value
      : editingMessage.content
    : draftValue.editingMessageId === null
      ? draftValue.value
      : "";

  const clearAttachmentsForEditingMessage = useEffectEvent(() => {
    onClearAttachments();
  });

  useEffect(() => {
    if (
      editingMessageId &&
      previousEditingMessageIdRef.current !== editingMessageId
    ) {
      previousEditingMessageIdRef.current = editingMessageId;
      clearAttachmentsForEditingMessage();
      return;
    }

    if (!editingMessageId) {
      previousEditingMessageIdRef.current = null;
    }
  }, [editingMessageId]);

  function clearComposer() {
    setDraftValue({ editingMessageId: null, value: "" });
    onClearAttachments();
    setReplyingTo(null);
    setEditingMessage(null);
  }

  function clearReply() {
    setReplyingTo(null);
  }

  function cancelEditing() {
    setEditingMessage(null);
    setDraftValue({ editingMessageId: null, value: "" });
  }

  function handleValueChange(nextValue: string) {
    if (errorMessage) {
      onClearError?.();
    }

    setDraftValue({
      editingMessageId,
      value: nextValue,
    });
  }

  return {
    cancelEditing,
    clearComposer,
    clearReply,
    editingMessage,
    handleValueChange,
    replyingTo,
    value,
  };
}
