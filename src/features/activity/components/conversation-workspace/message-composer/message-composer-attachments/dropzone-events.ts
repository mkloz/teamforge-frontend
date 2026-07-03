import type { DragEvent as ReactDragEvent } from "react";

interface DropzoneAvailability {
  isDisabled: boolean;
  isEditing: boolean;
}

export function hasDraggedFiles(
  event: DragEvent | ReactDragEvent<HTMLElement>,
) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

export function getDroppedFiles(fileList: FileList | null) {
  return fileList ? Array.from(fileList) : [];
}

export function isDropzoneBlocked({
  isDisabled,
  isEditing,
}: DropzoneAvailability) {
  return isDisabled || isEditing;
}

function getFileDropEffect(isBlocked: boolean) {
  return isBlocked ? "none" : "copy";
}

export function prepareFileDragEvent(
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

export function getRootDroppedFiles(
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

export function appendDroppedFiles(
  files: File[],
  appendAttachments: (files: File[]) => void,
) {
  if (files.length > 0) {
    appendAttachments(files);
  }
}
