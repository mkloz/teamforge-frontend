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
  const displayInviteLink = inviteLink.includes("localhost")
    ? "teamforge.app"
    : inviteLink.replace(/^https?:\/\//, "");

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
      <HomeSectionHeading
        title="Bring someone in"
        description="For the group that needs one familiar face."
      />

      <div className="rounded-xl border border-forge-teal/25 bg-forge-teal/10 px-3 py-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-black text-foreground text-sm">
              Share TeamForge
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-snug">
              Send the link now. Invite them when it fits.
            </p>
          </div>

          <div
            className="relative mt-0.5 flex h-9 w-14 shrink-0 items-center"
            aria-hidden="true"
          >
            <span className="absolute right-7 size-7 rounded-full border-2 border-background bg-forge-teal/80" />
            <span className="absolute right-3.5 size-7 rounded-full border-2 border-background bg-spark-amber/85" />
            <span className="absolute right-0 size-7 rounded-full border-2 border-background bg-slate-muted/80" />
          </div>
        </div>

        <div className="main-action-grid mt-3 grid items-center gap-2">
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
              aria-label={copied ? "Invite link copied" : "Copy invite link"}
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

  showAppSuccessToast("Invite link copied.", { id: "home-invite-link-copy" });
}
