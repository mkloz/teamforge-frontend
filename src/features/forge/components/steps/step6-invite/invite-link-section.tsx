import { Check, Copy, Link2, QrCode } from "lucide-react";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import {
  showAppErrorMessageToast,
  showAppSuccessToast,
} from "@/shared/lib/app-toast";
import {
  copyTextToClipboard,
  getCurrentBrowserOrigin,
} from "@/shared/lib/browser-capabilities";
import { cn } from "@/shared/lib/utils";

interface InviteLinkSectionProps {
  groupId: string | null;
  inviteCopied: boolean;
  onCopyLink: () => void;
}

export function InviteLinkSection({
  groupId,
  inviteCopied,
  onCopyLink,
}: InviteLinkSectionProps) {
  const groupLink = groupId
    ? `${getCurrentBrowserOrigin()}/groups/${encodeURIComponent(groupId)}`
    : null;

  const handleCopy = async () => {
    if (!groupLink) {
      showAppErrorMessageToast("The group link is not ready yet.");
      return;
    }

    if (!(await copyTextToClipboard(groupLink))) {
      showAppErrorMessageToast("We couldn't copy that link in this browser.");
      return;
    }

    onCopyLink();
    showAppSuccessToast("Group link copied.", {
      id: "forge-group-link-copy",
    });
  };

  return (
    <section className="flex flex-col gap-3 border-border/25 border-t pt-4">
      <div className="flex items-center gap-2 px-0.5">
        <IconTile icon={Link2} tone="teal" size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm leading-none">
            Group link
          </p>
          <p className="mt-1 text-micro text-muted-foreground/55 leading-none">
            Keep this handy for members who have access.
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 border-border/25 border-t pt-3">
        <code className="min-w-0 flex-1 truncate font-semibold text-muted-foreground text-xs">
          {groupLink ?? "Group link pending"}
        </code>
        {groupLink ? (
          <QrShareDialog
            url={groupLink}
            title="Group QR Code"
            description="Scan to open this group in TeamForge."
            trigger={
              <Button
                variant="outline"
                size="icon"
                aria-label="Show group QR code"
                className="size-8 shrink-0 rounded-lg border-border/40 text-foreground transition-colors hover:border-forge-teal/25 hover:bg-forge-teal/8 hover:text-forge-teal active:scale-95"
              >
                <QrCode size={15} strokeWidth={2} />
              </Button>
            }
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Group QR code unavailable"
            disabled
            className="size-8 shrink-0 rounded-lg border-border/40 text-muted-foreground"
          >
            <QrCode size={15} strokeWidth={2} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void handleCopy();
          }}
          disabled={!groupLink}
          aria-label="Copy group link"
          className={cn(
            "h-8 shrink-0 rounded-lg px-3 font-semibold text-xs transition-colors active:scale-95",
            inviteCopied
              ? "bg-forge-teal text-primary-foreground hover:bg-forge-teal/90"
              : "border border-border/40 bg-transparent text-foreground hover:border-forge-teal/25 hover:bg-forge-teal/8 hover:text-forge-teal",
          )}
        >
          {inviteCopied ? (
            <>
              <Check size={13} strokeWidth={2.5} />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} strokeWidth={2} />
              Copy
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
