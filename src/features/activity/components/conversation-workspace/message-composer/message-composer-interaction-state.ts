interface MessageComposerInteractionStateInput {
  disabled: boolean;
  editingMessageId?: string;
  isEditing: boolean;
  isOnline: boolean;
  isRecording: boolean;
  isSendingGif: boolean;
  isSendingVoiceNote: boolean;
  hasEditingMessage: boolean;
  hasReplyingToMessage: boolean;
  pendingAttachmentCount: number;
  replyingToId?: string;
  submitDisabled: boolean;
  submitIsSubmitting: boolean;
  value: string;
}

export function getMessageComposerInteractionState({
  disabled,
  editingMessageId,
  isEditing,
  isOnline,
  isRecording,
  isSendingGif,
  isSendingVoiceNote,
  hasEditingMessage,
  hasReplyingToMessage,
  pendingAttachmentCount,
  replyingToId,
  submitDisabled,
  submitIsSubmitting,
  value,
}: MessageComposerInteractionStateInput) {
  const sendState = getComposerSendState({
    isSendingGif,
    isSendingVoiceNote,
    submitDisabled,
    submitIsSubmitting,
  });
  const focusState = getComposerFocusState({
    editingMessageId,
    hasEditingMessage,
    hasReplyingToMessage,
    replyingToId,
  });

  return {
    areNetworkActionsDisabled: isNetworkActionDisabled({
      isDisabled: sendState.isDisabled,
      isOnline,
    }),
    hasDraft: hasComposerDraft({ pendingAttachmentCount, value }),
    isDisabled: sendState.isDisabled,
    isDropzoneDisabled: isDropzoneDisabled({
      disabled,
      isAsyncSendPending: sendState.isAsyncSendPending,
      isOnline,
    }),
    isGifSendDisabled: isGifSendDisabled({
      disabled,
      isAsyncSendPending: sendState.isAsyncSendPending,
    }),
    isTypingSignalPaused: isTypingSignalPaused({
      isAsyncSendPending: sendState.isAsyncSendPending,
      isEditing,
      isOnline,
      isRecording,
    }),
    ...focusState,
  };
}

function getComposerSendState({
  isSendingGif,
  isSendingVoiceNote,
  submitDisabled,
  submitIsSubmitting,
}: Pick<
  MessageComposerInteractionStateInput,
  | "isSendingGif"
  | "isSendingVoiceNote"
  | "submitDisabled"
  | "submitIsSubmitting"
>) {
  return {
    isAsyncSendPending: hasAnyActiveFlag(
      submitIsSubmitting,
      isSendingVoiceNote,
      isSendingGif,
    ),
    isDisabled: hasAnyActiveFlag(
      submitDisabled,
      isSendingVoiceNote,
      isSendingGif,
    ),
  };
}

function getComposerFocusState({
  editingMessageId,
  hasEditingMessage,
  hasReplyingToMessage,
  replyingToId,
}: Pick<
  MessageComposerInteractionStateInput,
  | "editingMessageId"
  | "hasEditingMessage"
  | "hasReplyingToMessage"
  | "replyingToId"
>) {
  return {
    composerActionFocusKey: getComposerActionFocusKey({
      editingMessageId,
      hasEditingMessage,
      hasReplyingToMessage,
      replyingToId,
    }),
    shouldMoveActionCaretToEnd: hasEditingMessage,
  };
}

function hasComposerDraft({
  pendingAttachmentCount,
  value,
}: {
  pendingAttachmentCount: number;
  value: string;
}) {
  return hasAnyActiveFlag(hasTextContent(value), pendingAttachmentCount > 0);
}

function hasTextContent(value: string) {
  return value.trim().length > 0;
}

function isNetworkActionDisabled({
  isDisabled,
  isOnline,
}: {
  isDisabled: boolean;
  isOnline: boolean;
}) {
  return hasAnyActiveFlag(isDisabled, !isOnline);
}

function isDropzoneDisabled({
  disabled,
  isAsyncSendPending,
  isOnline,
}: {
  disabled: boolean;
  isAsyncSendPending: boolean;
  isOnline: boolean;
}) {
  return hasAnyActiveFlag(!isOnline, disabled, isAsyncSendPending);
}

function isGifSendDisabled({
  disabled,
  isAsyncSendPending,
}: {
  disabled: boolean;
  isAsyncSendPending: boolean;
}) {
  return hasAnyActiveFlag(disabled, isAsyncSendPending);
}

function isTypingSignalPaused({
  isAsyncSendPending,
  isEditing,
  isOnline,
  isRecording,
}: {
  isAsyncSendPending: boolean;
  isEditing: boolean;
  isOnline: boolean;
  isRecording: boolean;
}) {
  return hasAnyActiveFlag(
    !isOnline,
    isRecording,
    isAsyncSendPending,
    isEditing,
  );
}

function getComposerActionFocusKey({
  editingMessageId,
  hasEditingMessage,
  hasReplyingToMessage,
  replyingToId,
}: {
  editingMessageId?: string;
  hasEditingMessage: boolean;
  hasReplyingToMessage: boolean;
  replyingToId?: string;
}) {
  if (hasEditingMessage) {
    return `edit:${editingMessageId}`;
  }

  return hasReplyingToMessage ? `reply:${replyingToId}` : null;
}

export function shouldFocusComposerAction({
  composerActionFocusKey,
  isDisabled,
  isRecording,
  previousActionFocusKey,
}: {
  composerActionFocusKey: string;
  isDisabled: boolean;
  isRecording: boolean;
  previousActionFocusKey: string | null;
}) {
  const isRepeatFocusTarget = previousActionFocusKey === composerActionFocusKey;

  return !hasAnyActiveFlag(isRepeatFocusTarget, isDisabled, isRecording);
}

function hasAnyActiveFlag(...flags: boolean[]) {
  return flags.includes(true);
}
