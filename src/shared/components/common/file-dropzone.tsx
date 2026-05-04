import {
  FileText,
  Image as ImageIcon,
  Loader2,
  MousePointerClick,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type FileDropzoneVariant = "cover" | "avatar" | "compact" | "inline";

export interface FileDropzoneProps {
  accept?: string;
  actionLabel?: string;
  className?: string;
  description?: string;
  disabled?: boolean;
  error?: string | null;
  helper?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  isUploading?: boolean;
  maxFiles?: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  preview?: ReactNode;
  title: string;
  variant?: FileDropzoneVariant;
}

interface FilePreviewListProps {
  files: File[];
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
    return "min-h-40 rounded-2xl";
  }

  if (variant === "avatar") {
    return "min-h-18 rounded-2xl sm:min-h-24";
  }

  if (variant === "inline") {
    return "min-h-22 rounded-2xl";
  }

  return "min-h-28 rounded-2xl";
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

  return multiple ? "Files ready" : "Single file";
}

export function FileDropzone({
  accept,
  actionLabel,
  className,
  description,
  disabled = false,
  error = null,
  helper,
  inputRef,
  isUploading = false,
  maxFiles,
  multiple = false,
  onFiles,
  preview,
  title,
  variant = "compact",
}: FileDropzoneProps) {
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const resolvedInputRef = inputRef ?? internalInputRef;
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

  return (
    <div className={cn("space-y-2", className)}>
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
          "group relative flex h-auto w-full cursor-pointer overflow-hidden border-2 border-dashed bg-card p-0 text-left whitespace-normal transition-colors duration-150 focus-visible:ring-forge-teal/35",
          getVariantClasses(variant),
          isDragging
            ? "border-forge-teal bg-forge-teal/8"
            : "border-border/60 hover:border-forge-teal/45 hover:bg-forge-teal/4",
          error && "border-destructive/50 bg-destructive/5",
          isInactive && "cursor-not-allowed opacity-70",
        )}
        contentClassName="block h-full w-full"
      >
        {preview ? <div className="absolute inset-0">{preview}</div> : null}

        <div
          className={cn(
            "relative z-10 flex w-full gap-3 p-4",
            variant === "cover" &&
              "min-h-40 items-end bg-linear-to-t from-black/55 via-black/20 to-transparent text-white",
            variant === "avatar" && "min-h-18 items-center sm:min-h-24",
            variant !== "cover" && variant !== "avatar" && "items-center",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3",
              variant === "cover" && "pb-0.5",
            )}
          >
            <div
              className={cn(
                "flex shrink-0 items-center justify-center self-stretch text-forge-teal",
                variant === "cover" ? "w-7 text-white" : "w-7",
              )}
            >
              {isUploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <UploadCloud className="size-7" strokeWidth={2} />
              )}
            </div>

            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col",
                variant === "avatar" ? "items-start text-left" : "",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <p
                  className={cn(
                    "min-w-0 truncate text-sm font-semibold leading-tight",
                    variant === "cover" ? "text-white" : "text-ink",
                  )}
                >
                  {isUploading ? "Uploading..." : title}
                </p>
                {isDragging ? (
                  <span
                    className={cn(
                      "hidden shrink-0 rounded-full px-2 py-0.5 text-micro font-semibold sm:inline-flex",
                      variant === "cover"
                        ? "bg-white/18 text-white"
                        : "bg-forge-teal/12 text-forge-teal",
                    )}
                  >
                    Drop now
                  </span>
                ) : null}
              </div>

              {description ? (
                <p
                  className={cn(
                    "mt-1 line-clamp-1 text-xs leading-snug",
                    variant === "cover" ? "text-white/82" : "text-slate-muted",
                  )}
                >
                  {description}
                </p>
              ) : null}

              <div className="mt-2.5 hidden min-w-0 flex-wrap items-center gap-2 sm:flex">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
                    variant === "cover"
                      ? "bg-white/14 text-white/88"
                      : "bg-muted text-slate-muted",
                  )}
                >
                  <MousePointerClick size={11} />
                  {getDropHint(variant, multiple)}
                </span>
                {helper ? (
                  <span
                    className={cn(
                      "inline-flex min-w-0 max-w-full truncate rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
                      variant === "cover"
                        ? "bg-white/10 text-white/72"
                        : "bg-background/70 text-slate-muted/75",
                    )}
                  >
                    {helper}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {actionLabel ? (
            <span
              className={cn(
                "ml-auto hidden shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-200 sm:inline-flex",
                variant === "cover"
                  ? "border-white/28 bg-white/14 text-white group-hover:bg-white/20"
                  : "border-forge-teal/20 bg-forge-teal/8 text-forge-teal group-hover:bg-forge-teal/12",
              )}
            >
              {actionLabel}
            </span>
          ) : null}
        </div>
      </Button>

      <input
        ref={resolvedInputRef}
        type="file"
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

      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

export function FilePreviewList({ files, onRemove }: FilePreviewListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2">
      {files.map((file, index) => {
        const isImage = file.type.startsWith("image/");
        const Icon = isImage ? ImageIcon : FileText;

        return (
          <div
            key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-2.5"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-forge-teal/10 text-forge-teal">
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink">
                {file.name}
              </p>
              <p className="text-[11px] text-slate-muted">
                {formatFileSize(file.size)}
              </p>
            </div>
            {onRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-slate-muted hover:text-ink"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
