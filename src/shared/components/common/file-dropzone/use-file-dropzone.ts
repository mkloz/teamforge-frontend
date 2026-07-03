import { type DragEvent, type RefObject, useId, useRef, useState } from "react";
import {
  type FileDropzoneVariant,
  getFileDropzoneViewState,
  getFiles,
} from "@/shared/components/common/file-dropzone-view-state";

interface UseFileDropzoneInput {
  disabled: boolean;
  dropzoneClassName?: string;
  error: string | null;
  inputRef?: RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  maxFiles?: number;
  multiple: boolean;
  onFiles: (files: File[]) => void;
  title: string;
  variant: FileDropzoneVariant;
}

export function useFileDropzone({
  disabled,
  dropzoneClassName,
  error,
  inputRef,
  isUploading,
  maxFiles,
  multiple,
  onFiles,
  title,
  variant,
}: UseFileDropzoneInput) {
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const resolvedInputRef = inputRef ?? internalInputRef;
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const viewState = getFileDropzoneViewState({
    disabled,
    dropzoneClassName,
    error,
    isDragging,
    isUploading,
    maxFiles,
    multiple,
    title,
    variant,
  });

  const selectFiles = (fileList: FileList | null) => {
    const files = getFiles(fileList, viewState.fileLimit);

    if (files.length > 0) {
      onFiles(files);
    }
  };

  const openFilePicker = () => {
    resolvedInputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    if (viewState.isInactive) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    if (viewState.isInactive) {
      return;
    }

    event.preventDefault();
    setIsDragging(false);
    selectFiles(event.dataTransfer.files);
  };

  return {
    handleDragLeave,
    handleDragOver,
    handleDrop,
    inputId,
    isDragging,
    openFilePicker,
    resolvedInputRef,
    selectFiles,
    viewState,
  };
}
