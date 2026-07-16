import { useEffect } from "react";

import { useChatTypingSignal } from "@/features/activity/hooks/use-chat-typing-signal";
import { useVoiceRecording } from "@/features/activity/hooks/use-voice-recording";
import type {
  ActivityOutgoingGifAttachment,
  ActivitySendMessageInput,
} from "@/features/activity/lib/activity-contract";
import { useAutoResize } from "@/shared/hooks/use-auto-resize";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

import { getMessageComposerInteractionState } from "./message-composer-interaction-state";
import { MAX_TEXTAREA_HEIGHT } from "./message-composer-utils";
import { useComposerActionFocus } from "./use-message-composer/action-focus";
import { useComposerAttachmentActions } from "./use-message-composer/attachment-actions";
import { getMessageComposerResult } from "./use-message-composer/composer-result";
import { insertComposerEmoji } from "./use-message-composer/emoji-caret";
import { sendComposerGif } from "./use-message-composer/gif-send";
import { useComposerLocalState } from "./use-message-composer/local-state";
import { guardComposerMessageOffline } from "./use-message-composer/offline-actions";
import { getMessageReferenceId } from "./use-message-composer/state";
import { useComposerVoiceNoteSender } from "./use-message-composer/voice-note-send";
import { useMessageComposerAttachments } from "./use-message-composer-attachments";
import { useMessageComposerDraft } from "./use-message-composer-draft";
import { useMessageComposerSubmit } from "./use-message-composer-submit";

interface UseMessageComposerOptions {
  allowAttachments: boolean;
  allowGif: boolean;
  allowVoiceNotes: boolean;
  chatId: string | null;
  disabled: boolean;
  dropzoneRoot?: HTMLElement | null;
  errorMessage: string | null;
  onClearError?: () => void;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
}

export function useMessageComposer({
  allowAttachments,
  allowGif,
  allowVoiceNotes,
  chatId,
  disabled,
  dropzoneRoot = null,
  errorMessage,
  onClearError,
  onSend,
}: UseMessageComposerOptions) {
  const localState = useComposerLocalState();
  const {
    isFocused,
    isSendingGif,
    isSendingVoiceNote,
    previousActionFocusKeyRef,
    setIsSendingGif,
    setIsSendingVoiceNote,
  } = localState;
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
  const { appendAttachments, clearAttachments, pendingAttachments } =
    attachments;

  const draft = useMessageComposerDraft({
    errorMessage,
    onClearAttachments: clearAttachments,
    onClearError,
  });

  useEffect(() => {
    if (!allowAttachments && pendingAttachments.length > 0) {
      clearAttachments();
    }
  }, [allowAttachments, clearAttachments, pendingAttachments.length]);

  useEffect(() => {
    if (!allowVoiceNotes && isRecording) {
      cancelRecording();
    }
  }, [allowVoiceNotes, cancelRecording, isRecording]);

  const editingActive = draft.editingMessage !== null;
  const editingMessageId = getMessageReferenceId(draft.editingMessage);
  const replyingToId = getMessageReferenceId(draft.replyingTo);
  const submit = useMessageComposerSubmit({
    disabled,
    isOnline,
    isEditing: editingActive,
    onClearComposer: draft.clearComposer,
    onOfflineSubmit: () => guardComposerMessageOffline(guardOfflineAction),
    onSend,
    pendingAttachments: allowAttachments ? pendingAttachments : [],
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
    pendingAttachmentCount: pendingAttachments.length,
    replyingToId,
    submitDisabled: submit.isDisabled,
    submitIsSubmitting: submit.isSubmitting,
    value: draft.value,
  });

  const attachmentActions = useComposerAttachmentActions({
    appendAttachments,
    dropzoneRoot,
    guardOfflineAction,
    isDropzoneDisabled: isDropzoneDisabled || !allowAttachments,
    isEditing: editingActive,
  });

  const textareaRef = useAutoResize({
    value: draft.value,
    maxHeight: MAX_TEXTAREA_HEIGHT,
  });

  function insertEmoji(emoji: string) {
    insertComposerEmoji({
      emoji,
      onValueChange: draft.handleValueChange,
      textareaRef,
      value: draft.value,
    });
  }

  async function sendGif(gif: ActivityOutgoingGifAttachment) {
    if (!allowGif) {
      return;
    }

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

  const handleStopRecording = useComposerVoiceNoteSender({
    disabled: disabled || !allowVoiceNotes,
    guardOfflineAction,
    isOnline,
    isSendingVoiceNote,
    onSend,
    onSent: draft.clearReply,
    setIsSendingVoiceNote,
    stopRecording,
    submitIsSubmitting: submit.isSubmitting,
  });

  useComposerActionFocus({
    composerActionFocusKey,
    isDisabled,
    isRecording,
    previousActionFocusKeyRef,
    shouldMoveActionCaretToEnd,
    textareaRef,
  });

  return getMessageComposerResult({
    areNetworkActionsDisabled,
    attachmentActions,
    attachments,
    cancelRecording,
    draft,
    editingActive,
    formatRecordingTime,
    handleStopRecording,
    hasDraft,
    insertEmoji,
    isDisabled,
    isFocused,
    isOnline,
    isRecording,
    recordingError,
    recordingTime,
    sendGif,
    setIsFocused: localState.setIsFocused,
    startRecording: allowVoiceNotes ? startRecording : async () => {},
    submit,
    textareaRef,
  });
}
