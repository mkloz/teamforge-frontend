import type { RefObject } from "react";

import type { useComposerAttachmentActions } from "@/features/activity/components/conversation-workspace/message-composer/use-message-composer/attachment-actions";
import type { useMessageComposerAttachments } from "@/features/activity/components/conversation-workspace/message-composer/use-message-composer-attachments";
import type { useMessageComposerDraft } from "@/features/activity/components/conversation-workspace/message-composer/use-message-composer-draft";
import type { useMessageComposerSubmit } from "@/features/activity/components/conversation-workspace/message-composer/use-message-composer-submit";
import type { ActivityOutgoingGifAttachment } from "@/features/activity/lib/activity-contract";

interface MessageComposerResultInput {
  areNetworkActionsDisabled: boolean;
  attachmentActions: ReturnType<typeof useComposerAttachmentActions>;
  attachments: ReturnType<typeof useMessageComposerAttachments>;
  cancelRecording: () => void;
  draft: ReturnType<typeof useMessageComposerDraft>;
  editingActive: boolean;
  formatRecordingTime: (seconds: number) => string;
  handleStopRecording: () => Promise<void>;
  hasDraft: boolean;
  insertEmoji: (emoji: string) => void;
  isDisabled: boolean;
  isFocused: boolean;
  isOnline: boolean;
  isRecording: boolean;
  recordingError: string | null;
  recordingTime: number;
  sendGif: (gif: ActivityOutgoingGifAttachment) => Promise<void>;
  setIsFocused: (isFocused: boolean) => void;
  startRecording: () => Promise<void>;
  submit: ReturnType<typeof useMessageComposerSubmit>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export function getMessageComposerResult({
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
  setIsFocused,
  startRecording,
  submit,
  textareaRef,
}: MessageComposerResultInput) {
  return {
    appendAttachments: attachmentActions.appendAttachments,
    appendImageAttachments: attachmentActions.appendImageAttachments,
    attachmentNotice: attachments.attachmentNotice,
    areNetworkActionsDisabled,
    cancelEditing: draft.cancelEditing,
    cancelRecording,
    clearReply: draft.clearReply,
    editingMessage: draft.editingMessage,
    formatRecordingTime,
    handleDragLeave: attachmentActions.dropzone.handleDragLeave,
    handleDragEnter: attachmentActions.dropzone.handleDragEnter,
    handleDragOver: attachmentActions.dropzone.handleDragOver,
    handleDrop: attachmentActions.dropzone.handleDrop,
    handleKeyDown: submit.handleKeyDown,
    handleStopRecording,
    handleSubmit: submit.handleSubmit,
    handleValueChange: draft.handleValueChange,
    insertEmoji,
    sendGif,
    hasDraft,
    isDisabled,
    isDraggingFiles: attachmentActions.dropzone.isDraggingFiles,
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
