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

interface AttachableFilesResult {
  attachableFiles: File[];
  skippedNonImages: number;
  skippedOversized: number;
}

interface AttachmentLimitNoticeState {
  allIncomingAlreadyAttached: boolean;
  isAtLimit: boolean;
  newlyAddedCount: number;
  skippedCount: number;
}

interface AttachmentLimitNoticeRule {
  getText: (state: AttachmentLimitNoticeState) => string;
  shouldShow: (state: AttachmentLimitNoticeState) => boolean;
}

const initialAttachmentState: MessageComposerAttachmentState = {
  attachmentNotice: null,
  pendingAttachments: [],
};

const ATTACHMENT_LIMIT_NOTICE_RULES = [
  {
    shouldShow: ({ isAtLimit }) => isAtLimit,
    getText: getAttachmentLimitReachedNotice,
  },
  {
    shouldShow: ({ skippedCount }) => skippedCount > 0,
    getText: getAttachmentLimitSkippedNotice,
  },
  {
    shouldShow: ({ allIncomingAlreadyAttached }) => allIncomingAlreadyAttached,
    getText: getAlreadyAttachedNotice,
  },
] as const satisfies AttachmentLimitNoticeRule[];

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
  const result = getAttachableFilesResult(files, selectionKind);

  return {
    attachableFiles: result.attachableFiles,
    skippedNotice: getSkippedAttachmentNotice({
      skippedNonImages: result.skippedNonImages,
      skippedOversized: result.skippedOversized,
    }),
  };
}

function getAttachableFilesResult(
  files: File[],
  selectionKind: MessageComposerAttachmentSelectionKind,
) {
  const result: AttachableFilesResult = {
    attachableFiles: [],
    skippedNonImages: 0,
    skippedOversized: 0,
  };

  for (const file of files) {
    addAttachableFileResult(result, file, selectionKind);
  }

  return result;
}

function addAttachableFileResult(
  result: AttachableFilesResult,
  file: File,
  selectionKind: MessageComposerAttachmentSelectionKind,
) {
  const disposition = getAttachmentFileDisposition(file, selectionKind);

  if (disposition === "attach") {
    result.attachableFiles.push(file);
    return;
  }

  if (disposition === "oversized") {
    result.skippedOversized += 1;
    return;
  }

  result.skippedNonImages += 1;
}

function getAttachmentFileDisposition(
  file: File,
  selectionKind: MessageComposerAttachmentSelectionKind,
) {
  if (!isChatAttachmentWithinSizeLimit(file)) {
    return "oversized";
  }

  if (selectionKind === "image" && !isImageAttachmentCandidate(file)) {
    return "non-image";
  }

  return "attach";
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
  const noticeState = getAttachmentLimitNoticeState({
    currentAttachments,
    incomingFiles,
    nextAttachments,
  });

  return getAttachmentLimitNoticeText(noticeState);
}

function getAttachmentLimitNoticeState({
  currentAttachments,
  incomingFiles,
  nextAttachments,
}: {
  currentAttachments: ActivityOutgoingAttachment[];
  incomingFiles: File[];
  nextAttachments: ActivityOutgoingAttachment[];
}): AttachmentLimitNoticeState {
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

  return {
    allIncomingAlreadyAttached:
      newlyAddedCount === 0 &&
      [...incomingUniqueKeys].every((key) => currentKeys.has(key)),
    isAtLimit: currentAttachments.length >= CHAT_MAX_ATTACHMENTS,
    newlyAddedCount,
    skippedCount,
  };
}

function getAttachmentLimitNoticeText({
  allIncomingAlreadyAttached,
  isAtLimit,
  newlyAddedCount,
  skippedCount,
}: AttachmentLimitNoticeState) {
  const state = {
    allIncomingAlreadyAttached,
    isAtLimit,
    newlyAddedCount,
    skippedCount,
  };

  return (
    ATTACHMENT_LIMIT_NOTICE_RULES.find((rule) =>
      rule.shouldShow(state),
    )?.getText(state) ?? null
  );
}

function getAttachmentLimitReachedNotice() {
  return `Messages support up to ${CHAT_MAX_ATTACHMENTS} attachments. Remove one before adding more.`;
}

function getAttachmentLimitSkippedNotice({
  newlyAddedCount,
}: AttachmentLimitNoticeState) {
  return `Attached ${Math.max(newlyAddedCount, 0)} file${newlyAddedCount === 1 ? "" : "s"}. Messages support up to ${CHAT_MAX_ATTACHMENTS} attachments.`;
}

function getAlreadyAttachedNotice() {
  return "Those files are already attached.";
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

interface DropzoneAvailability {
  isDisabled: boolean;
  isEditing: boolean;
}

function hasDraggedFiles(event: DragEvent | ReactDragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function getDroppedFiles(fileList: FileList | null) {
  return fileList ? Array.from(fileList) : [];
}

function isDropzoneBlocked({ isDisabled, isEditing }: DropzoneAvailability) {
  return isDisabled || isEditing;
}

function getFileDropEffect(isBlocked: boolean) {
  return isBlocked ? "none" : "copy";
}

function prepareFileDragEvent(
  event: DragEvent | ReactDragEvent<HTMLElement>,
  isBlocked: boolean,
) {
  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = getFileDropEffect(isBlocked);
  }
}

function shouldIgnoreRootDrop(event: DragEvent, resetDragState: () => void) {
  if (!hasDraggedFiles(event)) {
    return true;
  }

  if (event.defaultPrevented) {
    resetDragState();
    return true;
  }

  return false;
}

function getRootDroppedFiles(
  event: DragEvent,
  isBlocked: boolean,
  resetDragState: () => void,
) {
  if (shouldIgnoreRootDrop(event, resetDragState)) {
    return [];
  }

  event.preventDefault();
  resetDragState();
  return getEnabledDroppedFiles(event, isBlocked);
}

function getEnabledDroppedFiles(event: DragEvent, isBlocked: boolean) {
  if (isBlocked) {
    return [];
  }

  return getDroppedFiles(event.dataTransfer?.files ?? null);
}

function appendDroppedFiles(
  files: File[],
  appendAttachments: UseMessageComposerDropzoneOptions["appendAttachments"],
) {
  if (files.length > 0) {
    appendAttachments(files);
  }
}

export function useMessageComposerDropzone({
  appendAttachments,
  dropzoneRoot = null,
  isDisabled,
  isEditing,
}: UseMessageComposerDropzoneOptions) {
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);
  const isBlocked = isDropzoneBlocked({ isDisabled, isEditing });

  const resetDragState = useCallback(() => {
    dragDepthRef.current = 0;
    setIsDraggingFiles(false);
  }, []);

  function handleDragEnter(event: ReactDragEvent<HTMLDivElement>) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    prepareFileDragEvent(event, isBlocked);

    if (isBlocked) {
      return;
    }

    dragDepthRef.current += 1;
    setIsDraggingFiles(true);
  }

  function handleDragOver(event: ReactDragEvent<HTMLDivElement>) {
    if (!hasDraggedFiles(event)) {
      return;
    }

    prepareFileDragEvent(event, isBlocked);

    if (!isBlocked) {
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

    if (isBlocked) {
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

      prepareFileDragEvent(event, isBlocked);

      if (isBlocked) {
        return;
      }

      dragDepthRef.current += 1;
      setIsDraggingFiles(true);
    }

    function handleRootDragOver(event: DragEvent) {
      if (!hasDraggedFiles(event)) {
        return;
      }

      prepareFileDragEvent(event, isBlocked);

      if (!isBlocked) {
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
      appendDroppedFiles(
        getRootDroppedFiles(event, isBlocked, resetDragState),
        appendAttachments,
      );
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
  }, [appendAttachments, dropzoneRoot, isBlocked, resetDragState]);

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
