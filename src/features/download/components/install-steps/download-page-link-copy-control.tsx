import ClipboardCheck from "lucide-react/dist/esm/icons/clipboard-check.js";
import ClipboardCopy from "lucide-react/dist/esm/icons/clipboard-copy.js";
import {
  getDownloadPageLink,
  useDownloadPageLinkCopy,
} from "@/features/download/hooks/use-download-share";
import { Button } from "@/shared/components/ui/button";

interface DownloadPageLinkCopyControlProps {
  copied: boolean;
  onCopy: () => Promise<void>;
}

function DownloadPageLinkCopyControl({
  copied,
  onCopy,
}: DownloadPageLinkCopyControlProps) {
  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border border-border/80 bg-background px-3 py-2">
        <span className="truncate font-mono text-slate-muted text-xs">
          {getDownloadPageLink()}
        </span>
      </div>
      <Button variant="outline" size="sm" className="shrink-0" onClick={onCopy}>
        {copied ? (
          <>
            <ClipboardCheck size={14} strokeWidth={2} aria-hidden="true" />
            Copied!
          </>
        ) : (
          <>
            <ClipboardCopy size={14} strokeWidth={2} aria-hidden="true" />
            Copy link
          </>
        )}
      </Button>
    </div>
  );
}

export function DownloadPageLinkCopy() {
  const { copied, copyCurrentPageUrl } = useDownloadPageLinkCopy();

  return (
    <DownloadPageLinkCopyControl copied={copied} onCopy={copyCurrentPageUrl} />
  );
}
