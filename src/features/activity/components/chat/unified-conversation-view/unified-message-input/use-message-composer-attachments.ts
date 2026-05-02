import { useState } from "react";
import type { DragEvent } from "react";

import type { ActivityOutgoingAttachment } from "@/features/activity/lib/activity-contract";

import { dedupeAttachments } from "./message-composer-utils";

interface UseMessageComposerAttachmentsOptions {
  errorMessage: string | null;
  onClearError?: () => void;
}

export function useMessageComposerAttachments({
  errorMessage,
  onClearError,
}: UseMessageComposerAttachmentsOptions) {
  const [pendingAttachments, setPendingAttachments] = useState<
    ActivityOutgoingAttachment[]
  >([]);

  function clearAttachments() {
    setPendingAttachments([]);
  }

  function appendAttachments(files: File[]) {
    if (files.length === 0) {
      return;
    }

    if (errorMessage) {
      onClearError?.();
    }

    setPendingAttachments((current) =>
      dedupeAttachments([
        ...current,
        ...files.map((file) => ({
          file,
        })),
      ]),
    );
  }

  function removeAttachment(index: number) {
    if (errorMessage) {
      onClearError?.();
    }

    setPendingAttachments((current) => current.filter((_, i) => i !== index));
  }

  return {
    appendAttachments,
    clearAttachments,
    pendingAttachments,
    removeAttachment,
  };
}

interface UseMessageComposerDropzoneOptions {
  appendAttachments: (files: File[]) => void;
  isDisabled: boolean;
  isEditing: boolean;
}

export function useMessageComposerDropzone({
  appendAttachments,
  isDisabled,
  isEditing,
}: UseMessageComposerDropzoneOptions) {
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (isDisabled || isEditing) {
      return;
    }

    event.preventDefault();
    setIsDraggingFiles(true);
  }

  function handleDragLeave() {
    setIsDraggingFiles(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (isDisabled || isEditing) {
      return;
    }

    event.preventDefault();
    setIsDraggingFiles(false);
    appendAttachments(Array.from(event.dataTransfer.files));
  }

  return {
    handleDragLeave,
    handleDragOver,
    handleDrop,
    isDraggingFiles,
  };
}
