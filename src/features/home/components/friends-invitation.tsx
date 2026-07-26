import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { Button } from "@/shared/components/ui/button";
import {
  copyTextToClipboard,
  getCurrentBrowserOrigin,
  shareBrowserData,
} from "@/shared/lib/browser-capabilities";
import { cn } from "@/shared/lib/utils";

export function FriendsInvitation() {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inviteLink = getCurrentBrowserOrigin();
  const displayInviteLink = inviteLink.replace(/^https?:\/\//, "");

  // react-doctor-disable-next-line react-doctor/exhaustive-deps -- copiedTimeoutRef is a stable useRef object; cleanup only needs the latest .current on unmount.
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!(await copyTextToClipboard(inviteLink))) {
      void showInviteCopyError().catch(() => undefined);
      return;
    }

    setCopied(true);
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }

    copiedTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      copiedTimeoutRef.current = null;
    }, 2000);
    void showInviteCopySuccess().catch(() => undefined);
  };

  return (
    <section className="flex w-full flex-col gap-4">
      <HomeSectionHeading title="Invite someone" />

      <div className="rounded-xl border border-forge-teal/25 bg-forge-teal/10 px-3 py-3">
        <div className="main-action-grid grid items-center gap-2">
          <div
            className={cn(
              "group relative flex h-11 min-w-0 items-center rounded-md border border-border/45 bg-background/70 py-0 pr-12 pl-3",
              "transition-colors duration-150 hover:bg-forge-teal/8",
            )}
          >
            <span className="min-w-0 flex-1 truncate font-bold text-muted-foreground text-xs">
              {displayInviteLink}
            </span>
            <Button
              type="button"
              variant="accentGhost"
              size="icon-xs"
              onClick={handleCopy}
              className="absolute top-1/2 right-1 size-9 -translate-y-1/2 rounded-md"
              aria-label={
                copied ? "TeamForge link copied" : "Copy TeamForge link"
              }
            >
              {copied ? (
                <Check className="size-3.5 text-forge-teal" />
              ) : (
                <Copy className="size-3.5 text-muted-foreground" />
              )}
            </Button>
          </div>

          <Button
            variant="primary"
            className="rounded-md px-4 text-xs"
            onClick={async () => {
              const shareResult = await shareBrowserData({
                title: "Join me on TeamForge",
                text: "Find your people, intelligently.",
                url: inviteLink,
              });

              if (shareResult === "shared" || shareResult === "dismissed") {
                return;
              }

              await handleCopy();
            }}
          >
            <Share2 className="size-3.5" />
            Share
          </Button>
        </div>
      </div>
    </section>
  );
}

async function showInviteCopyError() {
  const { showAppErrorMessageToast } = await import("@/shared/lib/app-toast");

  showAppErrorMessageToast("We couldn't copy that link in this browser.");
}

async function showInviteCopySuccess() {
  const { showAppSuccessToast } = await import("@/shared/lib/app-toast");

  showAppSuccessToast("TeamForge link copied.", {
    id: "home-invite-link-copy",
  });
}
