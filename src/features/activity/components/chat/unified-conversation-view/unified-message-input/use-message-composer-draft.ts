import { useEffect, useEffectEvent, useRef, useState } from "react";

import { useActivityStore } from "@/features/activity/store/activity.store";

interface UseMessageComposerDraftOptions {
  errorMessage: string | null;
  onClearAttachments: () => void;
  onClearError?: () => void;
}

interface MessageComposerDraftValue {
  editingMessageId: string | null;
  value: string;
}

type DraftSourceMessage = { content: string; id: string } | null | undefined;

export function useMessageComposerDraft({
  errorMessage,
  onClearAttachments,
  onClearError,
}: UseMessageComposerDraftOptions) {
  const [draftValue, setDraftValue] = useState<MessageComposerDraftValue>(
    createEmptyDraftValue,
  );
  const previousEditingMessageIdRef = useRef<string | null>(null);

  const replyingTo = useActivityStore((state) => state.replyingTo);
  const editingMessage = useActivityStore((state) => state.editingMessage);
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);
  const setEditingMessage = useActivityStore(
    (state) => state.setEditingMessage,
  );

  const editingMessageId = editingMessage?.id ?? null;
  const value = resolveDraftValue(draftValue, editingMessage);

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
    setDraftValue(createEmptyDraftValue());
    onClearAttachments();
    setReplyingTo(null);
    setEditingMessage(null);
  }

  function clearReply() {
    setReplyingTo(null);
  }

  function cancelEditing() {
    setEditingMessage(null);
    setDraftValue(createEmptyDraftValue());
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

function createEmptyDraftValue(): MessageComposerDraftValue {
  return { editingMessageId: null, value: "" };
}

function resolveDraftValue(
  draftValue: MessageComposerDraftValue,
  editingMessage: DraftSourceMessage,
) {
  if (editingMessage) {
    return draftValue.editingMessageId === editingMessage.id
      ? draftValue.value
      : editingMessage.content;
  }

  return draftValue.editingMessageId === null ? draftValue.value : "";
}
