import { FileText, Image as ImageIcon, X } from "lucide-react";
import type {
  FilePreviewItemProps,
  FilePreviewListProps,
} from "@/shared/components/common/file-dropzone/file-dropzone.types";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
        <p className="text-slate-muted text-xs">{formatFileSize(file.size)}</p>
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
