import { useState } from "react";

import {
  getAttachableFiles,
  getPendingAttachmentsWithNotice,
  initialAttachmentState,
} from "./attachment-selection";
import type {
  MessageComposerAppendAttachmentOptions,
  MessageComposerAttachmentState,
} from "./types";

interface UseMessageComposerAttachmentsOptions {
  errorMessage: string | null;
  onClearError?: () => void;
}

export function useMessageComposerAttachments({
  errorMessage,
  onClearError,
}: UseMessageComposerAttachmentsOptions) {
  const [attachmentState, setAttachmentState] =
    useState<MessageComposerAttachmentState>(initialAttachmentState);

  function clearAttachments() {
    setAttachmentState(initialAttachmentState);
  }

  function appendAttachments(
    files: File[],
    { selectionKind = "any" }: MessageComposerAppendAttachmentOptions = {},
  ) {
    if (files.length === 0) {
      return;
    }

    if (errorMessage) {
      onClearError?.();
    }

    setAttachmentState((current) => {
      const { attachableFiles, skippedNotice } = getAttachableFiles(
        files,
        selectionKind,
      );

      if (attachableFiles.length === 0) {
        return {
          ...current,
          attachmentNotice: skippedNotice,
        };
      }

      return getPendingAttachmentsWithNotice({
        attachableFiles,
        currentAttachments: current.pendingAttachments,
        skippedNotice,
      });
    });
  }

  function removeAttachment(index: number) {
    if (errorMessage) {
      onClearError?.();
    }

    setAttachmentState((current) => ({
      attachmentNotice: null,
      pendingAttachments: current.pendingAttachments.filter(
        (_, i) => i !== index,
      ),
    }));
  }

  return {
    attachmentNotice: attachmentState.attachmentNotice,
    appendAttachments,
    clearAttachments,
    pendingAttachments: attachmentState.pendingAttachments,
    removeAttachment,
  };
}
