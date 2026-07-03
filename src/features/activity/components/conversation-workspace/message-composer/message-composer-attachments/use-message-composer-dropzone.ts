import type { DragEvent as ReactDragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  appendDroppedFiles,
  getDroppedFiles,
  getRootDroppedFiles,
  hasDraggedFiles,
  isDropzoneBlocked,
  prepareFileDragEvent,
} from "./dropzone-events";
import type { MessageComposerAppendAttachmentOptions } from "./types";

interface UseMessageComposerDropzoneOptions {
  appendAttachments: (
    files: File[],
    options?: MessageComposerAppendAttachmentOptions,
  ) => void;
  dropzoneRoot?: HTMLElement | null;
  isDisabled: boolean;
  isEditing: boolean;
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
