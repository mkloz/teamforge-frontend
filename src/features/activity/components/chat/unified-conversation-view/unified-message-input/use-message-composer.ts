import { useEffect, useRef, useState } from "react";

import { useChatTypingSignal } from "@/features/activity/hooks/use-chat-typing-signal";
import { useVoiceRecording } from "@/features/activity/hooks/use-voice-recording";
import type {
  ActivityOutgoingGifAttachment,
  ActivitySendMessageInput,
} from "@/features/activity/lib/activity-contract";
import { useAutoResize } from "@/shared/hooks/use-auto-resize";
import { warnInDevelopment } from "@/shared/lib/development-warning";

import { MAX_TEXTAREA_HEIGHT } from "./message-composer-utils";
import {
  useMessageComposerAttachments,
  useMessageComposerDropzone,
} from "./use-message-composer-attachments";
import { useMessageComposerDraft } from "./use-message-composer-draft";
import { useMessageComposerSubmit } from "./use-message-composer-submit";
import { useVoiceNoteSender } from "./use-voice-note-sender";

interface UseMessageComposerOptions {
  chatId: string | null;
  disabled: boolean;
  errorMessage: string | null;
  onClearError?: () => void;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
}

export function useMessageComposer({
  chatId,
  disabled,
  errorMessage,
  onClearError,
  onSend,
}: UseMessageComposerOptions) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSendingVoiceNote, setIsSendingVoiceNote] = useState(false);
  const [isSendingGif, setIsSendingGif] = useState(false);
  const previousActionFocusKeyRef = useRef<string | null>(null);

  const {
    isRecording,
    recordingTime,
    recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
    formatRecordingTime,
  } = useVoiceRecording();

  const attachments = useMessageComposerAttachments({
    errorMessage,
    onClearError,
  });

  const draft = useMessageComposerDraft({
    errorMessage,
    onClearAttachments: attachments.clearAttachments,
    onClearError,
  });

  const editingActive = draft.editingMessage !== null;
  const submit = useMessageComposerSubmit({
    disabled,
    isEditing: editingActive,
    onClearComposer: draft.clearComposer,
    onSend,
    pendingAttachments: attachments.pendingAttachments,
    value: draft.value,
  });

  const dropzone = useMessageComposerDropzone({
    appendAttachments: attachments.appendAttachments,
    isDisabled:
      disabled || submit.isSubmitting || isSendingVoiceNote || isSendingGif,
    isEditing: editingActive,
  });

  const textareaRef = useAutoResize({
    value: draft.value,
    maxHeight: MAX_TEXTAREA_HEIGHT,
  });

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? draft.value.length;
    const selectionEnd = textarea?.selectionEnd ?? draft.value.length;
    const nextValue = `${draft.value.slice(0, selectionStart)}${emoji}${draft.value.slice(selectionEnd)}`;
    const nextCaretPosition = selectionStart + emoji.length;

    draft.handleValueChange(nextValue);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        nextCaretPosition,
        nextCaretPosition,
      );
    }, 80);
  }

  async function sendGif(gif: ActivityOutgoingGifAttachment) {
    if (disabled || submit.isSubmitting || isSendingVoiceNote || isSendingGif) {
      return;
    }

    setIsSendingGif(true);

    try {
      await onSend({
        content: "",
        gif,
      });
      draft.clearReply();
    } catch (error) {
      warnInDevelopment("GIF message send failed.", error);
    } finally {
      setIsSendingGif(false);
    }
  }

  const hasDraft =
    draft.value.trim().length > 0 || attachments.pendingAttachments.length > 0;

  useChatTypingSignal({
    chatId,
    isFocused,
    isPaused:
      isRecording ||
      submit.isSubmitting ||
      isSendingVoiceNote ||
      isSendingGif ||
      editingActive,
    text: draft.value,
  });

  const handleStopRecording = useVoiceNoteSender({
    isDisabled: disabled || submit.isSubmitting || isSendingVoiceNote,
    onSend,
    onSent: draft.clearReply,
    setIsSubmitting: setIsSendingVoiceNote,
    stopRecording,
  });

  const isDisabled = submit.isDisabled || isSendingVoiceNote || isSendingGif;
  const composerActionFocusKey = draft.editingMessage
    ? `edit:${draft.editingMessage.id}`
    : draft.replyingTo
      ? `reply:${draft.replyingTo.id}`
      : null;
  const shouldMoveActionCaretToEnd = Boolean(draft.editingMessage);

  useEffect(() => {
    if (!composerActionFocusKey) {
      previousActionFocusKeyRef.current = null;
      return undefined;
    }

    if (
      previousActionFocusKeyRef.current === composerActionFocusKey ||
      isDisabled ||
      isRecording
    ) {
      return undefined;
    }

    previousActionFocusKeyRef.current = composerActionFocusKey;

    const timeoutId = window.setTimeout(() => {
      const textarea = textareaRef.current;

      if (!textarea || textarea.disabled) {
        return;
      }

      textarea.focus({ preventScroll: true });

      if (shouldMoveActionCaretToEnd) {
        const caretPosition = textarea.value.length;
        textarea.setSelectionRange(caretPosition, caretPosition);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    composerActionFocusKey,
    isDisabled,
    isRecording,
    shouldMoveActionCaretToEnd,
    textareaRef,
  ]);

  return {
    appendAttachments: attachments.appendAttachments,
    cancelEditing: draft.cancelEditing,
    cancelRecording,
    clearReply: draft.clearReply,
    editingMessage: draft.editingMessage,
    formatRecordingTime,
    handleDragLeave: dropzone.handleDragLeave,
    handleDragOver: dropzone.handleDragOver,
    handleDrop: dropzone.handleDrop,
    handleKeyDown: submit.handleKeyDown,
    handleStopRecording,
    handleSubmit: submit.handleSubmit,
    handleValueChange: draft.handleValueChange,
    insertEmoji,
    sendGif,
    hasDraft,
    isDisabled,
    isDraggingFiles: dropzone.isDraggingFiles,
    isEditing: editingActive,
    isFocused,
    isRecording,
    pendingAttachments: attachments.pendingAttachments,
    recordingError,
    recordingTime,
    removeAttachment: attachments.removeAttachment,
    replyingTo: draft.replyingTo,
    setIsFocused,
    startRecording,
    textareaRef,
    value: draft.value,
  };
}
