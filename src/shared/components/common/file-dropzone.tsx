import { FileText, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import {
  type DragEvent,
  type ReactNode,
  type RefObject,
  useId,
  useRef,
  useState,
} from "react";

import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import {
  type FileDropzoneVariant,
  type FileDropzoneViewState,
  getFileDropzoneViewState,
  getFiles,
} from "./file-dropzone-view-state";

export type { FileDropzoneVariant };

export interface FileDropzoneProps {
  accept?: string;
  actionLabel?: string;
  className?: string;
  description?: string;
  disabled?: boolean;
  dropzoneClassName?: string;
  error?: string | null;
  helper?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  isUploading?: boolean;
  maxFiles?: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  preview?: ReactNode;
  showMeta?: boolean;
  title: string;
  variant?: FileDropzoneVariant;
}

interface FilePreviewListProps {
  files: File[];
  onRemove?: (index: number) => void;
}

interface FilePreviewItemProps {
  file: File;
  index: number;
  onRemove?: (index: number) => void;
}

interface DropzonePreviewLayersProps {
  isDragging: boolean;
  preview?: ReactNode;
}

interface DropzoneIconProps {
  isUploading: boolean;
  viewState: FileDropzoneViewState;
}

interface DropzoneTextProps {
  description?: string;
  isDragging: boolean;
  viewState: FileDropzoneViewState;
}

interface DropzoneActionPillProps {
  actionLabel?: string;
  showMeta: boolean;
  viewState: FileDropzoneViewState;
}

interface DropzoneMetaRowProps {
  actionLabel?: string;
  helper?: string;
  showMeta: boolean;
  viewState: FileDropzoneViewState;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

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

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    if (viewState.isInactive) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    if (viewState.isInactive) {
      return;
    }

    event.preventDefault();
    setIsDragging(false);
    selectFiles(event.dataTransfer.files);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        type="button"
        variant="ghost"
        disabled={viewState.isInactive}
        onClick={() => {
          resolvedInputRef.current?.click();
        }}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={viewState.rootButtonClassName}
        contentClassName="block size-full"
      >
        <DropzonePreviewLayers preview={preview} isDragging={isDragging} />

        <div className={viewState.bodyClassName}>
          <div className="flex min-w-0 items-start gap-4">
            <DropzoneIcon isUploading={isUploading} viewState={viewState} />
            <DropzoneText
              description={description}
              isDragging={isDragging}
              viewState={viewState}
            />
            <DropzoneActionPill
              actionLabel={actionLabel}
              showMeta={showMeta}
              viewState={viewState}
            />
          </div>

          <DropzoneMetaRow
            actionLabel={actionLabel}
            helper={helper}
            showMeta={showMeta}
            viewState={viewState}
          />
        </div>
      </Button>

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

function DropzonePreviewLayers({
  isDragging,
  preview,
}: DropzonePreviewLayersProps) {
  return (
    <>
      {preview ? <div className="absolute inset-0">{preview}</div> : null}

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-forge-teal/8 via-transparent to-forge-teal/4" />
      )}
    </>
  );
}

function DropzoneIcon({ isUploading, viewState }: DropzoneIconProps) {
  return (
    <IconTile
      tone="none"
      size="lg"
      shape="square"
      className={viewState.iconTileClassName}
    >
      {isUploading ? (
        <Loader2 className="size-4 animate-spin" strokeWidth={2} />
      ) : (
        <Upload className={viewState.uploadIconClassName} strokeWidth={2} />
      )}
    </IconTile>
  );
}

function DropzoneText({
  description,
  isDragging,
  viewState,
}: DropzoneTextProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex min-w-0 items-center gap-2">
        <p className={viewState.titleClassName}>{viewState.titleText}</p>

        {isDragging && (
          <StatusPill
            tone="none"
            size="xs"
            textCase="upper"
            className={viewState.dropPillClassName}
          >
            Drop
          </StatusPill>
        )}
      </div>

      {description && (
        <p className={viewState.descriptionClassName}>{description}</p>
      )}
    </div>
  );
}

function DropzoneActionPill({
  actionLabel,
  showMeta,
  viewState,
}: DropzoneActionPillProps) {
  if (showMeta || !actionLabel) {
    return null;
  }

  return (
    <StatusPill tone="none" size="md" className={viewState.actionPillClassName}>
      {actionLabel}
    </StatusPill>
  );
}

function DropzoneMetaRow({
  actionLabel,
  helper,
  showMeta,
  viewState,
}: DropzoneMetaRowProps) {
  if (!showMeta) {
    return null;
  }

  return (
    <div className="hidden min-w-0 flex-wrap items-center gap-1.5 sm:flex">
      <StatusPill
        tone="none"
        size="xs"
        className={viewState.dropHintPillClassName}
      >
        {viewState.dropHint}
      </StatusPill>

      {helper && (
        <StatusPill
          tone="none"
          size="xs"
          className={viewState.helperPillClassName}
        >
          {helper}
        </StatusPill>
      )}

      {actionLabel && (
        <StatusPill
          tone="none"
          size="md"
          className={viewState.actionPillClassName}
        >
          {actionLabel}
        </StatusPill>
      )}
    </div>
  );
}

export function FilePreviewList({ files, onRemove }: FilePreviewListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2">
      {files.map((file, index) => (
        <FilePreviewItem
          key={`${file.name}-${file.size}-${file.lastModified}`}
          file={file}
          index={index}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function FilePreviewItem({ file, index, onRemove }: FilePreviewItemProps) {
  const isImage = file.type.startsWith("image/");
  const Icon = isImage ? ImageIcon : FileText;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/55 bg-card px-3 py-2.5">
      <IconTile
        icon={Icon}
        tone="teal"
        size="lg"
        shape="square"
        className="size-9"
        iconClassName="size-3.75"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink text-xs">{file.name}</p>
        <p className="text-micro text-slate-muted">
          {formatFileSize(file.size)}
        </p>
      </div>
      {onRemove ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-slate-muted hover:text-ink"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${file.name}`}
            >
              <X size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove file</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}
