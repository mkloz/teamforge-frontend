import { Download, FileText } from "lucide-react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { formatFileSize } from "@/features/activity/lib/chat-utils";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { openExternalUrl } from "@/shared/lib/browser-capabilities";
import { cn } from "@/shared/lib/utils";

interface DocumentMessageProps {
  attachment: UnifiedAttachment;
  isOwn?: boolean;
}

interface DocumentMessageViewState {
  fileExt: string;
  fileName: string;
  fileSize: string;
}

function getDocumentMessageViewState(
  attachment: UnifiedAttachment,
): DocumentMessageViewState {
  return {
    fileExt: attachment.name?.split(".").pop()?.toUpperCase() || "DOC",
    fileName: attachment.name || "File",
    fileSize: formatFileSize(attachment.size || 0),
  };
}

/**
 * DocumentMessage - Renders a download card for file attachments.
 */
export function DocumentMessage({ attachment, isOwn }: DocumentMessageProps) {
  const viewState = getDocumentMessageViewState(attachment);

  return (
    <div
      className={cn(
        "group/doc flex w-full min-w-0 max-w-full items-center gap-2.5 rounded-xl border p-2 transition-colors sm:min-w-48",
        isOwn
          ? "border-white/5 bg-white/10 hover:bg-white/15"
          : "border-border/40 bg-muted/30 hover:bg-muted/50",
      )}
    >
      <DocumentMessageIcon isOwn={isOwn} />

      <DocumentMessageDetails isOwn={isOwn} viewState={viewState} />

      <DocumentDownloadButton attachment={attachment} isOwn={isOwn} />
    </div>
  );
}

function DocumentMessageFileIcon({ isOwn }: { isOwn?: boolean }) {
  return (
    <FileText className={cn("size-5", isOwn ? "text-white" : "text-primary")} />
  );
}

function DocumentMessageIcon({ isOwn }: { isOwn?: boolean }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg shadow-xs transition-transform group-hover/doc:scale-105",
        isOwn
          ? "bg-white/10"
          : "border border-border/20 bg-white/60 dark:bg-canvas/10",
      )}
    >
      <DocumentMessageFileIcon isOwn={isOwn} />
    </div>
  );
}

function DocumentMessageDetails({
  isOwn,
  viewState,
}: {
  isOwn?: boolean;
  viewState: DocumentMessageViewState;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <p
        className={cn(
          "truncate font-bold text-sm tracking-tight",
          isOwn ? "text-white" : "text-ink",
        )}
      >
        {viewState.fileName}
      </p>
      <div className="flex items-center gap-1.5 opacity-60">
        <DocumentMetaValue isOwn={isOwn}>
          {viewState.fileSize}
        </DocumentMetaValue>
        <div
          className={cn(
            "size-0.5 rounded-full",
            isOwn ? "bg-white/50" : "bg-slate-muted/50",
          )}
        />
        <DocumentMetaValue isOwn={isOwn}>{viewState.fileExt}</DocumentMetaValue>
      </div>
    </div>
  );
}

function DocumentMetaValue({
  children,
  isOwn,
}: {
  children: string;
  isOwn?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-black text-nano uppercase tracking-wider",
        isOwn ? "text-white/80" : "text-slate-muted",
      )}
    >
      {children}
    </span>
  );
}

function DocumentDownloadButton({
  attachment,
  isOwn,
}: {
  attachment: UnifiedAttachment;
  isOwn?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => openExternalUrl(attachment.url)}
          className={cn(
            "size-8 rounded-lg transition",
            isOwn
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-primary/5 text-primary hover:bg-primary/10",
          )}
          aria-label={`Download ${attachment.name || "file"}`}
        >
          <Download className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Download file</TooltipContent>
    </Tooltip>
  );
}
