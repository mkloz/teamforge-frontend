import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Copy, Share2, Users, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  copyTextToClipboard,
  shareBrowserData,
} from "@/shared/lib/browser-capabilities";

/**
 * FriendsInvitation - A sidebar card to encourage users to invite friends to the platform.
 * Follows the Structured Warmth design system with mechanical transitions.
 */
export function FriendsInvitation() {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inviteLink = "teamforge.app/i/alex98"; // In a real app, this would be the user's referral code

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
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full flex flex-col gap-4"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-black tracking-tight text-foreground">
          Invite Friends
        </h2>
        <Users className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>

      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border bg-card p-5",
          "shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/80",
        )}
      >
        {/* Subtle Background Glow */}
        <div
          className="absolute -top-12 -right-12 size-32 bg-forge-teal/5 rounded-full blur-2xl transition-opacity group-hover:opacity-100 opacity-60"
          aria-hidden="true"
        />

        <div className="relative space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-black text-foreground tracking-tight">
              Build your tribe
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Invite friends and earn{" "}
              <span className="text-spark-amber font-bold">
                +10 Trust Score
              </span>{" "}
              for every connection that joins.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {/* Link Copy Bar */}
            <div
              className={cn(
                "flex items-center gap-2 h-10 px-3 rounded-xl border border-border bg-muted/20",
                "transition-colors duration-200 group-hover:bg-muted/30",
              )}
            >
              <span className="flex-1 text-[11px] font-bold text-muted-foreground truncate select-all">
                {inviteLink}
              </span>
              <button
                onClick={handleCopy}
                className="size-7 flex items-center justify-center rounded-lg hover:bg-background hover:shadow-sm transition-all active:scale-95"
                title="Copy link"
              >
                {copied ? (
                  <Check className="size-3.5 text-forge-teal" />
                ) : (
                  <Copy className="size-3.5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Share Button */}
            <Button
              variant="primary"
              className="w-full h-10 rounded-xl font-black text-[11px] gap-2"
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
              Share Invitation
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
