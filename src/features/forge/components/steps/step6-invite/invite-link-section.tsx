import { Check, Copy, QrCode } from "lucide-react";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
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
  className?: string;
  description?: string;
  groupId: string | null;
  heading?: string;
  inviteCopied: boolean;
  onCopyLink: () => void;
}

interface InviteLinkState {
  groupLink: string | null;
}

export function InviteLinkSection({
  className,
  description = "Anyone you invite can open the group from this link.",
  groupId,
  heading = "Share the group",
  inviteCopied,
  onCopyLink,
}: InviteLinkSectionProps) {
  const { groupLink } = getInviteLinkState(groupId);

  const handleCopy = async () => {
    await copyGroupLink({ groupLink, onCopyLink });
  };

  return (
    <section
      aria-labelledby="share-group-heading"
      className={cn("mt-7", className)}
    >
      <div>
        <h3
          id="share-group-heading"
          className="font-black text-foreground text-lg tracking-tight"
        >
          {heading}
        </h3>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-1.5 rounded-lg border border-border/55 bg-card/45 p-1.5">
        <code className="min-w-0 flex-1 truncate px-2 font-semibold text-muted-foreground text-xs">
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
  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        groupLink ? "Show group QR code" : "Group QR code unavailable"
      }
      disabled={!groupLink}
      className="size-9 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <QrCode className="size-4" strokeWidth={2} />
    </Button>
  );

  if (!groupLink) {
    return trigger;
  }

  return (
    <QrShareDialog
      url={groupLink}
      title="Group QR Code"
      description="Scan to open this group in TeamForge."
      trigger={trigger}
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
      className={cn(
        "h-9 shrink-0 rounded-md px-3 font-bold text-xs transition-colors active:scale-95",
        inviteCopied
          ? "bg-forge-teal text-primary-foreground hover:bg-forge-teal/90"
          : "bg-muted text-foreground hover:bg-forge-teal/10 hover:text-forge-teal",
      )}
    >
      {inviteCopied ? (
        <Check className="size-3.5" strokeWidth={2.5} />
      ) : (
        <Copy className="size-3.5" strokeWidth={2} />
      )}
      {inviteCopied ? "Copied" : "Copy link"}
    </Button>
  );
}
