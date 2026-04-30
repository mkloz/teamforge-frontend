import {
  FileText,
  Image as ImageIcon,
  Loader2,
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
    return "min-h-24 rounded-2xl";
  }

  if (variant === "inline") {
    return "min-h-22 rounded-2xl";
  }

  return "min-h-28 rounded-2xl";
}

function getFiles(fileList: FileList | null, maxFiles: number) {
  return fileList ? Array.from(fileList).slice(0, maxFiles) : [];
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

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (isInactive) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (isInactive) {
      return;
    }

    event.preventDefault();
    setIsDragging(false);
    selectFiles(event.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="button"
        tabIndex={isInactive ? -1 : 0}
        aria-disabled={isInactive}
        onClick={() => {
          if (!isInactive) {
            resolvedInputRef.current?.click();
          }
        }}
        onKeyDown={(event) => {
          if (!isInactive && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            resolvedInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group relative flex cursor-pointer overflow-hidden border-2 border-dashed bg-card text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35 focus-visible:ring-offset-2",
          getVariantClasses(variant),
          isDragging
            ? "border-forge-teal bg-forge-teal/8"
            : "border-border/60 hover:border-forge-teal/45 hover:bg-forge-teal/4",
          error && "border-destructive/50 bg-destructive/5",
          isInactive && "cursor-not-allowed opacity-70",
        )}
      >
        {preview ? <div className="absolute inset-0">{preview}</div> : null}

        <div
          className={cn(
            "relative z-10 flex w-full items-center gap-3 p-4",
            variant === "cover" &&
              "items-end bg-linear-to-t from-black/50 to-transparent text-white",
            variant === "avatar" && "justify-center text-center",
          )}
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background/85 text-forge-teal shadow-sm",
              variant === "avatar" && "size-11",
              variant === "cover" && "border-white/25 bg-white/90",
            )}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm font-semibold",
                variant === "cover" ? "text-white" : "text-ink",
              )}
            >
              {isUploading ? "Uploading..." : title}
            </p>
            {description ? (
              <p
                className={cn(
                  "mt-0.5 text-xs leading-snug",
                  variant === "cover" ? "text-white/80" : "text-slate-muted",
                )}
              >
                {description}
              </p>
            ) : null}
            {helper ? (
              <p
                className={cn(
                  "mt-1 text-[11px] font-medium",
                  variant === "cover" ? "text-white/70" : "text-slate-muted/75",
                )}
              >
                {helper}
              </p>
            ) : null}
          </div>

          {actionLabel ? (
            <span
              className={cn(
                "hidden shrink-0 rounded-full border px-3 py-1 text-xs font-semibold sm:inline-flex",
                variant === "cover"
                  ? "border-white/30 bg-white/15 text-white"
                  : "border-forge-teal/20 bg-forge-teal/8 text-forge-teal",
              )}
            >
              {actionLabel}
            </span>
          ) : null}
        </div>

        <input
          ref={resolvedInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={isInactive}
          className="sr-only"
          onChange={(event) => {
            selectFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
      </div>

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
