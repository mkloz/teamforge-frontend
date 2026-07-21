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

interface InviteLinkState {
  groupLink: string | null;
}

export function InviteLinkSection({
  groupId,
  inviteCopied,
  onCopyLink,
}: InviteLinkSectionProps) {
  const { groupLink } = getInviteLinkState(groupId);

  const handleCopy = async () => {
    await copyGroupLink({ groupLink, onCopyLink });
  };

  return (
    <section className="flex flex-col gap-3 border-border/25 border-t pt-4">
      <div className="flex items-center gap-2 px-0.5">
        <IconTile icon={Link2} tone="teal" size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm leading-none">
            Group link
          </p>
          <p className="mt-1 text-muted-foreground/55 text-xs leading-none">
            Keep this handy for members who have access.
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 border-border/25 border-t pt-3">
        <code className="min-w-0 flex-1 truncate font-semibold text-muted-foreground text-xs">
          {groupLink ?? "Group link pending"}
        </code>
        <InviteQrButton groupLink={groupLink} />
        <CopyInviteLinkButton
          groupLink={groupLink}
          inviteCopied={inviteCopied}
          onCopy={handleCopy}
        />
      </div>
    </section>
  );
}

function getInviteLinkState(groupId: string | null): InviteLinkState {
  return {
    groupLink: groupId
      ? `${getCurrentBrowserOrigin()}/groups/${encodeURIComponent(groupId)}`
      : null,
  };
}

async function copyGroupLink({
  groupLink,
  onCopyLink,
}: Pick<InviteLinkState, "groupLink"> &
  Pick<InviteLinkSectionProps, "onCopyLink">) {
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
}

function InviteQrButton({ groupLink }: Pick<InviteLinkState, "groupLink">) {
  if (!groupLink) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Group QR code unavailable"
        disabled
        className="size-11 shrink-0 rounded-lg border-border/40 text-muted-foreground md:size-8"
      >
        <QrCode size={15} strokeWidth={2} />
      </Button>
    );
  }

  return (
    <QrShareDialog
      url={groupLink}
      title="Group QR Code"
      description="Scan to open this group in TeamForge."
      trigger={
        <Button
          variant="outline"
          size="icon"
          aria-label="Show group QR code"
          className="size-11 shrink-0 rounded-lg border-border/40 text-foreground transition-colors hover:border-forge-teal/25 hover:bg-forge-teal/8 hover:text-forge-teal active:scale-95 md:size-8"
        >
          <QrCode size={15} strokeWidth={2} />
        </Button>
      }
    />
  );
}

function CopyInviteLinkButton({
  groupLink,
  inviteCopied,
  onCopy,
}: Pick<InviteLinkState, "groupLink"> &
  Pick<InviteLinkSectionProps, "inviteCopied"> & {
    onCopy: () => Promise<void>;
  }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        void onCopy();
      }}
      disabled={!groupLink}
      aria-label="Copy group link"
      className={getCopyButtonClassName(inviteCopied)}
    >
      {inviteCopied ? <CopiedButtonContent /> : <CopyButtonContent />}
    </Button>
  );
}

function getCopyButtonClassName(inviteCopied: boolean) {
  return cn(
    "h-11 shrink-0 rounded-lg px-3 font-semibold text-xs transition-colors active:scale-95 md:h-8",
    inviteCopied
      ? "bg-forge-teal text-primary-foreground hover:bg-forge-teal/90"
      : "border border-border/40 bg-transparent text-foreground hover:border-forge-teal/25 hover:bg-forge-teal/8 hover:text-forge-teal",
  );
}

function CopiedButtonContent() {
  return (
    <>
      <Check size={13} strokeWidth={2.5} />
      Copied
    </>
  );
}

function CopyButtonContent() {
  return (
    <>
      <Copy size={13} strokeWidth={2} />
      Copy
    </>
  );
}
