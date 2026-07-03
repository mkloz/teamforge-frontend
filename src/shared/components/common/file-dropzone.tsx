import type { FileDropzoneProps } from "@/shared/components/common/file-dropzone/file-dropzone.types";
import { FileDropzoneButton } from "@/shared/components/common/file-dropzone/file-dropzone-button";
import { useFileDropzone } from "@/shared/components/common/file-dropzone/use-file-dropzone";
import { cn } from "@/shared/lib/utils";

export type { FileDropzoneProps } from "@/shared/components/common/file-dropzone/file-dropzone.types";
export { FilePreviewList } from "@/shared/components/common/file-dropzone/file-preview-list";

export function FileDropzone({
  accept,
  actionLabel,
  className,
  description,
  disabled = false,
  dropzoneClassName,
  error = null,
  helper,
  inputRef,
  isUploading = false,
  maxFiles,
  multiple = false,
  onFiles,
  preview,
  showMeta = true,
  title,
  variant = "compact",
}: FileDropzoneProps) {
  const {
    handleDragLeave,
    handleDragOver,
    handleDrop,
    inputId,
    isDragging,
    openFilePicker,
    resolvedInputRef,
    selectFiles,
    viewState,
  } = useFileDropzone({
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
  });

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <FileDropzoneButton
        actionLabel={actionLabel}
        description={description}
        helper={helper}
        isDragging={isDragging}
        isUploading={isUploading}
        preview={preview}
        showMeta={showMeta}
        viewState={viewState}
        onClick={openFilePicker}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />

      <input
        id={inputId}
        ref={resolvedInputRef}
        type="file"
        aria-label={title}
        accept={accept}
        multiple={multiple}
        disabled={viewState.isInactive}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          selectFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />

      {error && <p className="font-medium text-destructive text-xs">{error}</p>}
    </div>
  );
}
