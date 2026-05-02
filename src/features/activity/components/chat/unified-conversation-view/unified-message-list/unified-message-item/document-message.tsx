import { memo } from "react";
import { FileText, Download } from "lucide-react";
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
    className={cn(isOwn ? "text-white" : "text-forge-teal")}
    size={22}
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
        "flex items-center gap-2.5 p-2 rounded-xl border transition-colors group/doc w-full min-w-48",
        isOwn
          ? "bg-white/10 border-white/5 hover:bg-white/15"
          : "bg-muted/30 border-border/40 hover:bg-muted/50",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover/doc:scale-105",
          isOwn
            ? "bg-white/10"
            : "bg-white/60 dark:bg-canvas/10 border border-border/20",
        )}
      >
        {getFileIcon(isOwn)}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <p
          className={cn(
            "text-sm font-bold truncate tracking-tight",
            isOwn ? "text-white" : "text-ink",
          )}
        >
          {attachment.name || "File"}
        </p>
        <div className="flex items-center gap-1.5 opacity-60">
          <span
            className={cn(
              "text-nano font-black uppercase tracking-wider",
              isOwn ? "text-white/80" : "text-slate-muted",
            )}
          >
            {formatFileSize(attachment.size || 0)}
          </span>
          <div
            className={cn(
              "w-0.5 h-0.5 rounded-full",
              isOwn ? "bg-white/50" : "bg-slate-muted/50",
            )}
          />
          <span
            className={cn(
              "text-nano font-black uppercase tracking-wider",
              isOwn ? "text-white/80" : "text-slate-muted",
            )}
          >
            {fileExt}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openExternalUrl(attachment.url)}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-90",
          isOwn
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-forge-teal/5 text-forge-teal hover:bg-forge-teal/10",
        )}
      >
        <Download size={15} />
      </button>
    </div>
  );
});
