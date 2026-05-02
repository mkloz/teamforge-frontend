import { useState } from "react";

import { useChatTypingSignal } from "@/features/activity/hooks/use-chat-typing-signal";
import { useVoiceRecording } from "@/features/activity/hooks/use-voice-recording";
import type { ActivitySendMessageInput } from "@/features/activity/lib/activity-contract";
import { useAutoResize } from "@/shared/hooks/use-auto-resize";

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
    onClearComposer: draft.clearComposer,
    onSend,
    pendingAttachments: attachments.pendingAttachments,
    value: draft.value,
  });

  const dropzone = useMessageComposerDropzone({
    appendAttachments: attachments.appendAttachments,
    isDisabled: disabled || submit.isSubmitting || isSendingVoiceNote,
    isEditing: editingActive,
  });

  const textareaRef = useAutoResize({
    value: draft.value,
    maxHeight: MAX_TEXTAREA_HEIGHT,
  });

  const hasDraft =
    draft.value.trim().length > 0 || attachments.pendingAttachments.length > 0;

  useChatTypingSignal({
    chatId,
    isFocused,
    isPaused:
      isRecording || submit.isSubmitting || isSendingVoiceNote || editingActive,
    text: draft.value,
  });

  const handleStopRecording = useVoiceNoteSender({
    isDisabled: disabled || submit.isSubmitting || isSendingVoiceNote,
    onSend,
    onSent: draft.clearReply,
    setIsSubmitting: setIsSendingVoiceNote,
    stopRecording,
  });

  const isDisabled = submit.isDisabled || isSendingVoiceNote;

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
