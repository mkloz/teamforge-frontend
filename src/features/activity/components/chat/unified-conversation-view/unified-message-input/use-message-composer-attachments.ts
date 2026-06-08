import type { DragEvent as ReactDragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ActivityOutgoingAttachment } from "@/features/activity/lib/activity-contract";
import { CHAT_MAX_ATTACHMENTS } from "@/shared/api/api-constraints";

import {
  dedupeAttachments,
  getAttachmentFileKey,
  getChatAttachmentSizeLabel,
  isChatAttachmentWithinSizeLimit,
  isImageAttachmentCandidate,
} from "./message-composer-utils";

export type MessageComposerAttachmentSelectionKind = "any" | "image";

export interface MessageComposerAppendAttachmentOptions {
  selectionKind?: MessageComposerAttachmentSelectionKind;
}

interface UseMessageComposerAttachmentsOptions {
  errorMessage: string | null;
  onClearError?: () => void;
}

interface MessageComposerAttachmentState {
  attachmentNotice: string | null;
  pendingAttachments: ActivityOutgoingAttachment[];
}

const initialAttachmentState: MessageComposerAttachmentState = {
  attachmentNotice: null,
  pendingAttachments: [],
};

function pluralizeFile(count: number) {
  return count === 1 ? "file" : "files";
}

function getSkippedAttachmentNotice({
  skippedNonImages,
  skippedOversized,
}: {
  skippedNonImages: number;
  skippedOversized: number;
}) {
  const notices: string[] = [];

  if (skippedOversized > 0) {
    notices.push(
      `Skipped ${skippedOversized} ${pluralizeFile(skippedOversized)} over ${getChatAttachmentSizeLabel()}.`,
    );
  }

  if (skippedNonImages > 0) {
    notices.push(
      `Skipped ${skippedNonImages} non-image ${pluralizeFile(skippedNonImages)}. Use Documents for non-photo uploads.`,
    );
  }

  return notices.length > 0 ? notices.join(" ") : null;
}

function getAttachableFiles(
  files: File[],
  selectionKind: MessageComposerAttachmentSelectionKind,
) {
  const attachableFiles: File[] = [];
  let skippedNonImages = 0;
  let skippedOversized = 0;

  for (const file of files) {
    if (!isChatAttachmentWithinSizeLimit(file)) {
      skippedOversized += 1;
      continue;
    }

    if (selectionKind === "image" && !isImageAttachmentCandidate(file)) {
      skippedNonImages += 1;
      continue;
    }

    attachableFiles.push(file);
  }

  return {
    attachableFiles,
    skippedNotice: getSkippedAttachmentNotice({
      skippedNonImages,
      skippedOversized,
    }),
  };
}

function combineAttachmentNotices(...notices: Array<string | null>) {
  const combined = notices.filter((notice) => notice !== null);

  return combined.length > 0 ? combined.join(" ") : null;
}

function getAttachmentLimitNotice({
  currentAttachments,
  incomingFiles,
  nextAttachments,
}: {
  currentAttachments: ActivityOutgoingAttachment[];
  incomingFiles: File[];
  nextAttachments: ActivityOutgoingAttachment[];
}) {
  const currentKeys = new Set(
    currentAttachments.map(({ file }) => getAttachmentFileKey(file)),
  );
  const incomingUniqueKeys = new Set(
    incomingFiles.map((file) => getAttachmentFileKey(file)),
  );
  const requestedNewCount = [...incomingUniqueKeys].filter(
    (key) => !currentKeys.has(key),
  ).length;
  const newlyAddedCount = nextAttachments.length - currentAttachments.length;
  const skippedCount = requestedNewCount - newlyAddedCount;

  if (currentAttachments.length >= CHAT_MAX_ATTACHMENTS) {
    return `Messages support up to ${CHAT_MAX_ATTACHMENTS} attachments. Remove one before adding more.`;
  }

  if (skippedCount > 0) {
    return `Attached ${Math.max(newlyAddedCount, 0)} file${newlyAddedCount === 1 ? "" : "s"}. Messages support up to ${CHAT_MAX_ATTACHMENTS} attachments.`;
  }

  if (
    newlyAddedCount === 0 &&
    [...incomingUniqueKeys].every((key) => currentKeys.has(key))
  ) {
    return "Those files are already attached.";
  }

  return null;
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

      const pendingAttachments = dedupeAttachments([
        ...current.pendingAttachments,
        ...attachableFiles.map((file) => ({
          file,
        })),
      ]);
      const limitNotice = getAttachmentLimitNotice({
        currentAttachments: current.pendingAttachments,
        incomingFiles: attachableFiles,
        nextAttachments: pendingAttachments,
      });

      return {
        attachmentNotice: combineAttachmentNotices(skippedNotice, limitNotice),
        pendingAttachments,
      };
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

interface UseMessageComposerDropzoneOptions {
  appendAttachments: (
    files: File[],
    options?: MessageComposerAppendAttachmentOptions,
  ) => void;
  dropzoneRoot?: HTMLElement | null;
  isDisabled: boolean;
  isEditing: boolean;
}

function hasDraggedFiles(event: DragEvent | ReactDragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function getDroppedFiles(fileList: FileList | null) {
  return fileList ? Array.from(fileList) : [];
}

export function useMessageComposerDropzone({
  appendAttachments,
  dropzoneRoot = null,
  isDisabled,
  isEditing,
}: UseMessageComposerDropzoneOptions) {
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);

  const resetDragState = useCallback(() => {
    dragDepthRef.current = 0;
    setIsDraggingFiles(false);
  }, []);

  function handleDragEnter(event: ReactDragEvent<HTMLDivElement>) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = isDisabled || isEditing ? "none" : "copy";

    if (isDisabled || isEditing) {
      return;
    }

    dragDepthRef.current += 1;
    setIsDraggingFiles(true);
  }

  function handleDragOver(event: ReactDragEvent<HTMLDivElement>) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = isDisabled || isEditing ? "none" : "copy";

    if (!isDisabled && !isEditing) {
      setIsDraggingFiles(true);
    }
  }

  function handleDragLeave(event: ReactDragEvent<HTMLDivElement>) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDraggingFiles(false);
    }
  }

  function handleDrop(event: ReactDragEvent<HTMLDivElement>) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    resetDragState();

    if (isDisabled || isEditing) {
      return;
    }

    appendAttachments(getDroppedFiles(event.dataTransfer.files));
  }

  useEffect(() => {
    if (!dropzoneRoot) {
      resetDragState();
      return undefined;
    }

    function handleRootDragEnter(event: DragEvent) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect =
          isDisabled || isEditing ? "none" : "copy";
      }

      if (isDisabled || isEditing) {
        return;
      }

      dragDepthRef.current += 1;
      setIsDraggingFiles(true);
    }

    function handleRootDragOver(event: DragEvent) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect =
          isDisabled || isEditing ? "none" : "copy";
      }

      if (!isDisabled && !isEditing) {
        setIsDraggingFiles(true);
      }
    }

    function handleRootDragLeave(event: DragEvent) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

      if (dragDepthRef.current === 0) {
        setIsDraggingFiles(false);
      }
    }

    function handleRootDrop(event: DragEvent) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      if (event.defaultPrevented) {
        resetDragState();
        return;
      }

      event.preventDefault();
      resetDragState();

      if (isDisabled || isEditing) {
        return;
      }

      appendAttachments(getDroppedFiles(event.dataTransfer?.files ?? null));
    }

    dropzoneRoot.addEventListener("dragenter", handleRootDragEnter);
    dropzoneRoot.addEventListener("dragover", handleRootDragOver);
    dropzoneRoot.addEventListener("dragleave", handleRootDragLeave);
    dropzoneRoot.addEventListener("drop", handleRootDrop);

    return () => {
      dropzoneRoot.removeEventListener("dragenter", handleRootDragEnter);
      dropzoneRoot.removeEventListener("dragover", handleRootDragOver);
      dropzoneRoot.removeEventListener("dragleave", handleRootDragLeave);
      dropzoneRoot.removeEventListener("drop", handleRootDrop);
    };
  }, [appendAttachments, dropzoneRoot, isDisabled, isEditing, resetDragState]);

  useEffect(() => {
    if (isDisabled || isEditing) {
      resetDragState();
    }
  }, [isDisabled, isEditing, resetDragState]);

  return {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    isDraggingFiles,
  };
}
