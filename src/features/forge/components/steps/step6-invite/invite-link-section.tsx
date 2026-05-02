import { Check, Copy } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface InviteLinkSectionProps {
  inviteCopied: boolean;
  onCopyLink: () => void;
}

export function InviteLinkSection({
  inviteCopied,
  onCopyLink,
}: InviteLinkSectionProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">
        Share invite link
      </p>
      <div className="flex items-center gap-2 px-4 h-12 rounded-2xl border border-border/50 bg-card">
        <span className="flex-1 text-sm text-muted-foreground truncate font-mono">
          teamforge.app/join/grp_xk4j2m
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopyLink}
          aria-label="Copy invite link"
          className={cn(
            "flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95",
            inviteCopied
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
              : "bg-muted text-ink hover:bg-primary/10 hover:text-primary",
          )}
        >
          {inviteCopied ? (
            <>
              <Check size={12} strokeWidth={2.5} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={12} strokeWidth={2} />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
