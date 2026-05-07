import { useEffect, useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
      toast.error("We couldn't copy that link in this browser.");
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
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="flex w-full flex-col gap-4"
    >
      <HomeSectionHeading
        title="Bring someone in"
        description="For the group that needs one familiar face."
      />

      <div className="rounded-xl border border-border/45 bg-forge-teal/5 px-3 py-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-foreground">
              Share TeamForge with someone who would fit the room.
            </p>
            <p className="mt-1 text-xs leading-relaxed font-medium text-muted-foreground">
              Send the app now. Invite them to a group when the moment fits.
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

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div
            className={cn(
              "group flex h-11 min-w-0 items-center gap-2 rounded-md border border-border/45 bg-background/70 px-3",
              "transition-colors duration-150 hover:bg-forge-teal/8",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-xs font-bold text-muted-foreground">
              {displayInviteLink}
            </span>
            <Button
              type="button"
              variant="accentGhost"
              size="icon-xs"
              onClick={handleCopy}
              className="size-10 rounded-md"
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
            className="h-11 rounded-md px-4 text-xs font-black"
            onClick={() => {
              shareBrowserData({
                title: "Join me on TeamForge",
                text: "Find your people, intelligently.",
                url: inviteLink,
              }).then((result) => {
                if (result === "shared" || result === "dismissed") {
                  return;
                }

                void handleCopy();
              });
            }}
          >
            <Share2 className="size-3.5" />
            Share
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
