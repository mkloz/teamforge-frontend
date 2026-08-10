import { cn } from "@/shared/lib/utils";

import type { useMessageComposer } from "./use-message-composer";

export type MessageComposer = ReturnType<typeof useMessageComposer>;

interface MessageInputViewStateInput {
  composer: MessageComposer;
  errorMessage: string | null;
  placeholder: string;
}

export interface MessageInputViewState {
  attachmentFiles: File[];
  hasContextPanel: boolean;
  inputPillClasses: string;
  inputPlaceholder: string;
  isActionTargetDisabled: boolean;
  recordingErrorMessage: string | null;
  recordingTimeLabel: string;
}

const RECORDING_ERROR_MESSAGES = {
  "already-recording": "Recording failed. Please try again.",
  "not-supported": "Voice recording isn't supported on this browser.",
  "permission-denied": "Microphone access denied. Check your browser settings.",
  unknown: "Recording failed. Please try again.",
} as const satisfies Record<
  NonNullable<MessageComposer["recordingError"]>,
  string
>;

export function getMessageInputViewState({
  composer,
  errorMessage,
  placeholder,
}: MessageInputViewStateInput): MessageInputViewState {
  return {
    attachmentFiles: getAttachmentFiles(composer),
    hasContextPanel: hasMessageInputContextPanel(composer, errorMessage),
    inputPillClasses: getInputPillClasses(composer),
    inputPlaceholder: getInputPlaceholder(composer, placeholder),
    isActionTargetDisabled: isMessageInputActionTargetDisabled(composer),
    recordingErrorMessage: getRecordingErrorMessage(composer.recordingError),
    recordingTimeLabel: composer.formatRecordingTime(composer.recordingTime),
  };
}

function getAttachmentFiles(composer: MessageComposer) {
  return composer.pendingAttachments.map((attachment) => attachment.file);
}

function hasMessageInputContextPanel(
  composer: MessageComposer,
  errorMessage: string | null,
) {
  return [
    !composer.isEditing && composer.replyingTo,
    composer.isEditing,
    composer.pendingAttachments.length > 0,
    !composer.isOnline,
    composer.attachmentNotice,
    composer.recordingError,
    errorMessage,
  ].some(Boolean);
}

function getInputPlaceholder(composer: MessageComposer, placeholder: string) {
  return composer.isEditing ? "Edit your message..." : placeholder;
}

function isMessageInputActionTargetDisabled(composer: MessageComposer) {
  return composer.isRecording ? false : composer.areNetworkActionsDisabled;
}

function getInputPillClasses(composer: MessageComposer) {
  return cn(
    "relative flex min-h-11 min-w-0 flex-1 rounded-full border transition-colors duration-300",
    composer.isRecording
      ? "border-destructive/20 bg-destructive-soft"
      : composer.isFocused
        ? "border-primary/40 bg-card shadow-sm"
        : "border-border/50 bg-card/60 shadow-sm",
  );
}

function getRecordingErrorMessage(error: MessageComposer["recordingError"]) {
  if (!error) {
    return null;
  }

  return RECORDING_ERROR_MESSAGES[error];
}
