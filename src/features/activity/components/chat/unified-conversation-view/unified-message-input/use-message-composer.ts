import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { useChatTypingSignal } from "@/features/activity/hooks/use-chat-typing-signal";
import { useVoiceRecording } from "@/features/activity/hooks/use-voice-recording";
import type {
  ActivityOutgoingGifAttachment,
  ActivitySendMessageInput,
} from "@/features/activity/lib/activity-contract";
import { useAutoResize } from "@/shared/hooks/use-auto-resize";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { warnInDevelopment } from "@/shared/lib/development-warning";

import {
  getMessageComposerInteractionState,
  shouldFocusComposerAction,
} from "./message-composer-interaction-state";
import { MAX_TEXTAREA_HEIGHT } from "./message-composer-utils";
import {
  type MessageComposerAppendAttachmentOptions,
  useMessageComposerAttachments,
  useMessageComposerDropzone,
} from "./use-message-composer-attachments";
import { useMessageComposerDraft } from "./use-message-composer-draft";
import { useMessageComposerSubmit } from "./use-message-composer-submit";
import { useVoiceNoteSender } from "./use-voice-note-sender";

const OFFLINE_MESSAGE_DESCRIPTION =
  "Reconnect before sending messages or adding attachments.";
const OFFLINE_UPLOAD_DESCRIPTION =
  "Reconnect before adding files to this message.";
const EMOJI_CARET_RESTORE_DELAY_MS = 80;

interface UseMessageComposerOptions {
  chatId: string | null;
  disabled: boolean;
  dropzoneRoot?: HTMLElement | null;
  errorMessage: string | null;
  onClearError?: () => void;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
}

type OfflineActionGuard = ReturnType<
  typeof useOfflineActionGuard
>["guardOfflineAction"];

interface MessageReference {
  id: string;
}

export function useMessageComposer({
  chatId,
  disabled,
  dropzoneRoot = null,
  errorMessage,
  onClearError,
  onSend,
}: UseMessageComposerOptions) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSendingVoiceNote, setIsSendingVoiceNote] = useState(false);
  const [isSendingGif, setIsSendingGif] = useState(false);
  const previousActionFocusKeyRef = useRef<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

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
  const editingMessageId = getMessageReferenceId(draft.editingMessage);
  const replyingToId = getMessageReferenceId(draft.replyingTo);
  const submit = useMessageComposerSubmit({
    disabled,
    isOnline,
    isEditing: editingActive,
    onClearComposer: draft.clearComposer,
    onOfflineSubmit: () => {
      guardOfflineAction({
        id: "chat-message-offline",
        description: OFFLINE_MESSAGE_DESCRIPTION,
      });
    },
    onSend,
    pendingAttachments: attachments.pendingAttachments,
    value: draft.value,
  });
  const {
    areNetworkActionsDisabled,
    composerActionFocusKey,
    hasDraft,
    isDisabled,
    isDropzoneDisabled,
    isGifSendDisabled,
    isTypingSignalPaused,
    shouldMoveActionCaretToEnd,
  } = getMessageComposerInteractionState({
    disabled,
    editingMessageId,
    hasEditingMessage: Boolean(draft.editingMessage),
    hasReplyingToMessage: Boolean(draft.replyingTo),
    isEditing: editingActive,
    isOnline,
    isRecording,
    isSendingGif,
    isSendingVoiceNote,
    pendingAttachmentCount: attachments.pendingAttachments.length,
    replyingToId,
    submitDisabled: submit.isDisabled,
    submitIsSubmitting: submit.isSubmitting,
    value: draft.value,
  });

  function appendAttachments(
    files: File[],
    options?: MessageComposerAppendAttachmentOptions,
  ) {
    appendComposerAttachments({
      appendAttachments: attachments.appendAttachments,
      files,
      guardOfflineAction,
      options,
    });
  }

  function appendImageAttachments(files: File[]) {
    appendAttachments(files, { selectionKind: "image" });
  }

  const dropzone = useMessageComposerDropzone({
    appendAttachments,
    dropzoneRoot,
    isDisabled: isDropzoneDisabled,
    isEditing: editingActive,
  });

  const textareaRef = useAutoResize({
    value: draft.value,
    maxHeight: MAX_TEXTAREA_HEIGHT,
  });

  function insertEmoji(emoji: string) {
    const { nextCaretPosition, nextValue } = getEmojiInsertion({
      emoji,
      textarea: textareaRef.current,
      value: draft.value,
    });

    draft.handleValueChange(nextValue);
    restoreTextareaCaret(textareaRef, nextCaretPosition);
  }

  async function sendGif(gif: ActivityOutgoingGifAttachment) {
    await sendComposerGif({
      gif,
      guardOfflineAction,
      isGifSendDisabled,
      onSend,
      onSent: draft.clearReply,
      setIsSendingGif,
    });
  }

  useChatTypingSignal({
    chatId,
    isFocused,
    isPaused: isTypingSignalPaused,
    text: draft.value,
  });

  const handleStopRecording = useVoiceNoteSender({
    isDisabled: isVoiceNoteSendDisabled({
      disabled,
      isSendingVoiceNote,
      submitIsSubmitting: submit.isSubmitting,
    }),
    isOnline,
    onSend,
    onOfflineSubmit: () => {
      guardOfflineAction({
        id: "chat-voice-note-offline",
        description: OFFLINE_MESSAGE_DESCRIPTION,
      });
    },
    onSent: draft.clearReply,
    setIsSubmitting: setIsSendingVoiceNote,
    stopRecording,
  });

  useComposerActionFocus({
    composerActionFocusKey,
    isDisabled,
    isRecording,
    previousActionFocusKeyRef,
    shouldMoveActionCaretToEnd,
    textareaRef,
  });

  return {
    appendAttachments,
    appendImageAttachments,
    attachmentNotice: attachments.attachmentNotice,
    areNetworkActionsDisabled,
    cancelEditing: draft.cancelEditing,
    cancelRecording,
    clearReply: draft.clearReply,
    editingMessage: draft.editingMessage,
    formatRecordingTime,
    handleDragLeave: dropzone.handleDragLeave,
    handleDragEnter: dropzone.handleDragEnter,
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
    isOnline,
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

function getMessageReferenceId(message: MessageReference | null) {
  if (message === null) {
    return undefined;
  }

  return message.id;
}

function isVoiceNoteSendDisabled({
  disabled,
  isSendingVoiceNote,
  submitIsSubmitting,
}: {
  disabled: boolean;
  isSendingVoiceNote: boolean;
  submitIsSubmitting: boolean;
}) {
  return hasAnyComposerBlocker(
    disabled,
    submitIsSubmitting,
    isSendingVoiceNote,
  );
}

function hasAnyComposerBlocker(...blockers: boolean[]) {
  return blockers.includes(true);
}

function appendComposerAttachments({
  appendAttachments,
  files,
  guardOfflineAction,
  options,
}: {
  appendAttachments: (
    files: File[],
    options?: MessageComposerAppendAttachmentOptions,
  ) => void;
  files: File[];
  guardOfflineAction: OfflineActionGuard;
  options?: MessageComposerAppendAttachmentOptions;
}) {
  if (files.length === 0) {
    return;
  }

  if (
    guardOfflineAction({
      id: "chat-attachments-offline",
      description: OFFLINE_UPLOAD_DESCRIPTION,
    })
  ) {
    return;
  }

  appendAttachments(files, options);
}

async function sendComposerGif({
  gif,
  guardOfflineAction,
  isGifSendDisabled,
  onSend,
  onSent,
  setIsSendingGif,
}: {
  gif: ActivityOutgoingGifAttachment;
  guardOfflineAction: OfflineActionGuard;
  isGifSendDisabled: boolean;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
  onSent: () => void;
  setIsSendingGif: (isSendingGif: boolean) => void;
}) {
  if (
    guardOfflineAction({
      id: "chat-gif-offline",
      description: OFFLINE_MESSAGE_DESCRIPTION,
    })
  ) {
    return;
  }

  if (isGifSendDisabled) {
    return;
  }

  setIsSendingGif(true);

  try {
    await onSend({
      content: "",
      gif,
    });
    onSent();
  } catch (error) {
    warnInDevelopment("GIF message send failed.", error);
  } finally {
    setIsSendingGif(false);
  }
}

function getEmojiInsertion({
  emoji,
  textarea,
  value,
}: {
  emoji: string;
  textarea: HTMLTextAreaElement | null;
  value: string;
}) {
  const { selectionEnd, selectionStart } = getTextareaSelection({
    fallbackPosition: value.length,
    textarea,
  });

  return {
    nextCaretPosition: selectionStart + emoji.length,
    nextValue: insertTextAtSelection({
      insertion: emoji,
      selectionEnd,
      selectionStart,
      value,
    }),
  };
}

function getTextareaSelection({
  fallbackPosition,
  textarea,
}: {
  fallbackPosition: number;
  textarea: HTMLTextAreaElement | null;
}) {
  if (!textarea) {
    return {
      selectionEnd: fallbackPosition,
      selectionStart: fallbackPosition,
    };
  }

  return {
    selectionEnd: textarea.selectionEnd,
    selectionStart: textarea.selectionStart,
  };
}

function insertTextAtSelection({
  insertion,
  selectionEnd,
  selectionStart,
  value,
}: {
  insertion: string;
  selectionEnd: number;
  selectionStart: number;
  value: string;
}) {
  return `${value.slice(0, selectionStart)}${insertion}${value.slice(selectionEnd)}`;
}

function restoreTextareaCaret(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  caretPosition: number,
) {
  setTimeout(() => {
    textareaRef.current?.focus();
    textareaRef.current?.setSelectionRange(caretPosition, caretPosition);
  }, EMOJI_CARET_RESTORE_DELAY_MS);
}

function useComposerActionFocus({
  composerActionFocusKey,
  isDisabled,
  isRecording,
  previousActionFocusKeyRef,
  shouldMoveActionCaretToEnd,
  textareaRef,
}: {
  composerActionFocusKey: string | null;
  isDisabled: boolean;
  isRecording: boolean;
  previousActionFocusKeyRef: RefObject<string | null>;
  shouldMoveActionCaretToEnd: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  useEffect(() => {
    if (!composerActionFocusKey) {
      previousActionFocusKeyRef.current = null;
      return undefined;
    }

    if (
      !shouldFocusComposerAction({
        composerActionFocusKey,
        isDisabled,
        isRecording,
        previousActionFocusKey: previousActionFocusKeyRef.current,
      })
    ) {
      return undefined;
    }

    previousActionFocusKeyRef.current = composerActionFocusKey;

    const timeoutId = window.setTimeout(() => {
      focusComposerActionTextarea({
        shouldMoveActionCaretToEnd,
        textarea: textareaRef.current,
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    composerActionFocusKey,
    isDisabled,
    isRecording,
    previousActionFocusKeyRef,
    shouldMoveActionCaretToEnd,
    textareaRef,
  ]);
}

function focusComposerActionTextarea({
  shouldMoveActionCaretToEnd,
  textarea,
}: {
  shouldMoveActionCaretToEnd: boolean;
  textarea: HTMLTextAreaElement | null;
}) {
  if (!textarea || textarea.disabled) {
    return;
  }

  textarea.focus({ preventScroll: true });

  if (shouldMoveActionCaretToEnd) {
    const caretPosition = textarea.value.length;
    textarea.setSelectionRange(caretPosition, caretPosition);
  }
}
