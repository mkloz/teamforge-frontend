import { memo } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { formatFileSize } from "@/features/activity/lib/chat-utils";
import { openExternalUrl } from "@/shared/lib/browser-capabilities";

interface DocumentMessageProps {
  attachment: UnifiedAttachment;
  isOwn?: boolean;
}

const getFileIcon = (isOwn?: boolean) => (
  <FileText
    className={cn("size-5", isOwn ? "text-white" : "text-forge-teal")}
  />
);

/**
 * DocumentMessage - Renders a download card for file attachments.
 */
export const DocumentMessage = memo(function DocumentMessage({
  attachment,
  isOwn,
}: DocumentMessageProps) {
  const fileExt = attachment.name?.split(".").pop()?.toUpperCase() || "DOC";

  return (
    <div
      className={cn(
        "group/doc flex w-full min-w-48 items-center gap-2.5 rounded-xl border p-2 transition-colors",
        isOwn
          ? "border-white/5 bg-white/10 hover:bg-white/15"
          : "border-border/40 bg-muted/30 hover:bg-muted/50",
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg shadow-xs transition-transform group-hover/doc:scale-105",
          isOwn
            ? "bg-white/10"
            : "border border-border/20 bg-white/60 dark:bg-canvas/10",
        )}
      >
        {getFileIcon(isOwn)}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p
          className={cn(
            "truncate text-sm font-bold tracking-tight",
            isOwn ? "text-white" : "text-ink",
          )}
        >
          {attachment.name || "File"}
        </p>
        <div className="flex items-center gap-1.5 opacity-60">
          <span
            className={cn(
              "text-nano font-black tracking-wider uppercase",
              isOwn ? "text-white/80" : "text-slate-muted",
            )}
          >
            {formatFileSize(attachment.size || 0)}
          </span>
          <div
            className={cn(
              "size-0.5 rounded-full",
              isOwn ? "bg-white/50" : "bg-slate-muted/50",
            )}
          />
          <span
            className={cn(
              "text-nano font-black tracking-wider uppercase",
              isOwn ? "text-white/80" : "text-slate-muted",
            )}
          >
            {fileExt}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => openExternalUrl(attachment.url)}
        className={cn(
          "size-8 rounded-lg transition",
          isOwn
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-forge-teal/5 text-forge-teal hover:bg-forge-teal/10",
        )}
      >
        <Download className="size-4" />
      </Button>
    </div>
  );
});
