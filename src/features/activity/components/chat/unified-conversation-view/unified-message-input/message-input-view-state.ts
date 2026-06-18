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

export function getMessageInputViewState({
  composer,
  errorMessage,
  placeholder,
}: MessageInputViewStateInput): MessageInputViewState {
  return {
    attachmentFiles: composer.pendingAttachments.map(
      (attachment) => attachment.file,
    ),
    hasContextPanel: Boolean(
      (!composer.isEditing && composer.replyingTo) ||
        composer.isEditing ||
        composer.pendingAttachments.length > 0 ||
        !composer.isOnline ||
        composer.attachmentNotice ||
        composer.recordingError ||
        errorMessage,
    ),
    inputPillClasses: getInputPillClasses(composer),
    inputPlaceholder: composer.isEditing ? "Edit your message..." : placeholder,
    isActionTargetDisabled: composer.isRecording
      ? false
      : composer.areNetworkActionsDisabled,
    recordingErrorMessage: getRecordingErrorMessage(composer.recordingError),
    recordingTimeLabel: composer.formatRecordingTime(composer.recordingTime),
  };
}

function getInputPillClasses(composer: MessageComposer) {
  return cn(
    "relative flex min-h-11 min-w-0 flex-1 rounded-full border transition-colors duration-300",
    composer.isRecording
      ? "border-destructive/20 bg-destructive/5"
      : composer.isFocused
        ? "border-primary/40 bg-card shadow-sm"
        : "border-border/50 bg-card/60 shadow-sm",
  );
}

function getRecordingErrorMessage(error: MessageComposer["recordingError"]) {
  if (!error) {
    return null;
  }

  if (error === "permission-denied") {
    return "Microphone access denied. Check your browser settings.";
  }

  if (error === "not-supported") {
    return "Voice recording isn't supported on this browser.";
  }

  return "Recording failed. Please try again.";
}
