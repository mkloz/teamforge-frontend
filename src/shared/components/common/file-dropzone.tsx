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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

export type FileDropzoneVariant = "cover" | "avatar" | "compact" | "inline";

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

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getVariantClasses(variant: FileDropzoneVariant) {
  if (variant === "cover") {
    return "min-h-44 rounded-xl";
  }

  if (variant === "avatar") {
    return "min-h-20 rounded-lg sm:min-h-24";
  }

  if (variant === "inline") {
    return "min-h-24 rounded-lg";
  }

  return "min-h-28 rounded-lg";
}

function getFiles(fileList: FileList | null, maxFiles: number) {
  return fileList ? Array.from(fileList).slice(0, maxFiles) : [];
}

function getDropHint(variant: FileDropzoneVariant, multiple: boolean) {
  if (variant === "avatar") {
    return "Square image";
  }

  if (variant === "cover") {
    return "Landscape image";
  }

  return multiple ? "Multiple files" : "Single file";
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
  const fileLimit = maxFiles ?? (multiple ? 10 : 1);
  const isInactive = disabled || isUploading;

  const selectFiles = (fileList: FileList | null) => {
    const files = getFiles(fileList, fileLimit);

    if (files.length > 0) {
      onFiles(files);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    if (isInactive) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    if (isInactive) {
      return;
    }

    event.preventDefault();
    setIsDragging(false);
    selectFiles(event.dataTransfer.files);
  };

  const isCover = variant === "cover";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        type="button"
        variant="ghost"
        disabled={isInactive}
        onClick={() => {
          resolvedInputRef.current?.click();
        }}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group relative flex h-auto w-full cursor-pointer overflow-hidden whitespace-normal border border-border/55 bg-card p-0 text-left transition-all duration-200 focus-visible:ring-forge-teal/35",
          getVariantClasses(variant),
          isDragging
            ? "border-forge-teal/60 bg-forge-teal/5 ring-2 ring-forge-teal/15"
            : "hover:border-forge-teal/40 hover:bg-forge-teal/3 hover:ring-1 hover:ring-forge-teal/10",
          error && "border-destructive/45 bg-destructive/4",
          isInactive && "cursor-not-allowed opacity-60",
          dropzoneClassName,
        )}
        contentClassName="block size-full"
      >
        {/* Background preview image */}
        {preview ? <div className="absolute inset-0">{preview}</div> : null}

        {/* Drag-over shimmer overlay */}
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-forge-teal/8 via-transparent to-forge-teal/4" />
        )}

        <div
          className={cn(
            "relative z-10 flex w-full flex-col gap-2 px-5 py-4",
            isCover &&
              "min-h-44 justify-end bg-linear-to-t from-black/60 via-black/24 to-transparent text-white",
          )}
        >
          <div className="flex min-w-0 items-start gap-4">
            {/* Icon container */}
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-md transition-all duration-200",
                isCover
                  ? "size-9 bg-white/14 text-white group-hover:bg-white/20"
                  : "size-9 bg-forge-teal/10 text-forge-teal group-hover:bg-forge-teal/15",
                isDragging && !isCover && "scale-110 bg-forge-teal/18",
              )}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              ) : (
                <Upload
                  className={cn(
                    "size-4 transition-transform duration-200",
                    isDragging && "-translate-y-px",
                  )}
                  strokeWidth={2}
                />
              )}
            </div>

            {/* Text area */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex min-w-0 items-center gap-2">
                <p
                  className={cn(
                    "min-w-0 truncate font-semibold text-sm leading-tight tracking-tight",
                    isCover ? "text-white" : "text-ink",
                  )}
                >
                  {isUploading ? "Uploading…" : title}
                </p>

                {isDragging && (
                  <span
                    className={cn(
                      "type-signature-label shrink-0 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
                      isCover
                        ? "bg-white/20 text-white"
                        : "bg-forge-teal text-white",
                    )}
                  >
                    Drop
                  </span>
                )}
              </div>

              {description && (
                <p
                  className={cn(
                    "line-clamp-1 text-xs leading-snug",
                    isCover ? "text-white/78" : "text-slate-muted",
                  )}
                >
                  {description}
                </p>
              )}
            </div>

            {!showMeta && actionLabel && (
              <span
                className={cn(
                  "ml-auto hidden shrink-0 items-center rounded-full border px-4 py-1.5 font-semibold text-xs transition-all duration-200 sm:inline-flex",
                  isCover
                    ? "border-white/28 bg-white/12 text-white group-hover:bg-white/22"
                    : "border-forge-teal/25 bg-forge-teal/8 text-forge-teal group-hover:border-forge-teal/40 group-hover:bg-forge-teal/14",
                  isDragging &&
                    !isCover &&
                    "border-forge-teal/50 bg-forge-teal/18",
                )}
              >
                {actionLabel}
              </span>
            )}
          </div>

          {showMeta && (
            <div className="hidden min-w-0 flex-wrap items-center gap-1.5 sm:flex">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium text-micro leading-none",
                  isCover
                    ? "border-white/18 bg-white/10 text-white/80"
                    : "border-border/70 bg-muted/70 text-slate-muted",
                )}
              >
                {getDropHint(variant, multiple)}
              </span>

              {helper && (
                <span
                  className={cn(
                    "inline-flex min-w-0 max-w-full truncate rounded-full border px-2.5 py-0.5 font-medium text-micro leading-none",
                    isCover
                      ? "border-white/12 bg-white/6 text-white/60"
                      : "border-border/50 bg-muted/40 text-slate-muted/75",
                  )}
                >
                  {helper}
                </span>
              )}

              {actionLabel && (
                <span
                  className={cn(
                    "ml-auto hidden shrink-0 items-center rounded-full border px-4 py-1.5 font-semibold text-xs transition-all duration-200 sm:inline-flex",
                    isCover
                      ? "border-white/28 bg-white/12 text-white group-hover:bg-white/22"
                      : "border-forge-teal/25 bg-forge-teal/8 text-forge-teal group-hover:border-forge-teal/40 group-hover:bg-forge-teal/14",
                    isDragging &&
                      !isCover &&
                      "border-forge-teal/50 bg-forge-teal/18",
                  )}
                >
                  {actionLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </Button>

      <input
        id={inputId}
        ref={resolvedInputRef}
        type="file"
        aria-label={title}
        accept={accept}
        multiple={multiple}
        disabled={isInactive}
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
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-forge-teal/10 text-forge-teal">
        <Icon size={15} strokeWidth={2} />
      </div>
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
