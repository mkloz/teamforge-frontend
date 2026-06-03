import { Check, Copy, Link2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import {
  showAppErrorMessageToast,
  showAppSuccessToast,
} from "@/shared/lib/app-toast";
import { copyTextToClipboard } from "@/shared/lib/browser-capabilities";
import { cn } from "@/shared/lib/utils";

interface InviteLinkSectionProps {
  inviteCopied: boolean;
  onCopyLink: () => void;
}

const INVITE_LINK = "teamforge.app/join/grp_xk4j2m";

export function InviteLinkSection({
  inviteCopied,
  onCopyLink,
}: InviteLinkSectionProps) {
  const handleCopy = async () => {
    if (!(await copyTextToClipboard(INVITE_LINK))) {
      showAppErrorMessageToast("We couldn't copy that link in this browser.");
      return;
    }

    onCopyLink();
    showAppSuccessToast("Invite link copied.", {
      id: "forge-invite-link-copy",
    });
  };

  return (
    <section className="flex flex-col gap-3 border-border/25 border-t pt-4">
      <div className="flex items-center gap-2 px-0.5">
        <IconTile icon={Link2} tone="teal" size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm leading-none">
            Share access
          </p>
          <p className="mt-1 text-micro text-muted-foreground/55 leading-none">
            Keep this handy for late additions.
          </p>
        </div>
      </div>

      <div className="main-action-grid grid min-w-0 items-center gap-2 border-border/25 border-t pt-3">
        <code className="min-w-0 flex-1 truncate font-semibold text-muted-foreground text-xs">
          {INVITE_LINK}
        </code>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void handleCopy();
          }}
          aria-label="Copy invite link"
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
