import type { MessageComposerAppendAttachmentOptions } from "@/features/activity/components/conversation-workspace/message-composer/use-message-composer-attachments";
import { useMessageComposerDropzone } from "@/features/activity/components/conversation-workspace/message-composer/use-message-composer-attachments";

import { appendComposerAttachments } from "./offline-actions";
import type { OfflineActionGuard } from "./types";

interface UseComposerAttachmentActionsOptions {
  appendAttachments: (
    files: File[],
    options?: MessageComposerAppendAttachmentOptions,
  ) => void;
  dropzoneRoot: HTMLElement | null;
  guardOfflineAction: OfflineActionGuard;
  isDropzoneDisabled: boolean;
  isEditing: boolean;
}

export function useComposerAttachmentActions({
  appendAttachments,
  dropzoneRoot,
  guardOfflineAction,
  isDropzoneDisabled,
  isEditing,
}: UseComposerAttachmentActionsOptions) {
  function appendGuardedAttachments(
    files: File[],
    options?: MessageComposerAppendAttachmentOptions,
  ) {
    appendComposerAttachments({
      appendAttachments,
      files,
      guardOfflineAction,
      options,
    });
  }

  function appendImageAttachments(files: File[]) {
    appendGuardedAttachments(files, { selectionKind: "image" });
  }

  const dropzone = useMessageComposerDropzone({
    appendAttachments: appendGuardedAttachments,
    dropzoneRoot,
    isDisabled: isDropzoneDisabled,
    isEditing,
  });

  return {
    appendAttachments: appendGuardedAttachments,
    appendImageAttachments,
    dropzone,
  };
}
