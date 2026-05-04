import { Check, Copy, Link2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
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
  const handleCopy = () => {
    void navigator.clipboard?.writeText(INVITE_LINK).catch(() => undefined);
    onCopyLink();
  };

  return (
    <section className="space-y-3 border-t border-border/25 pt-4">
      <div className="flex items-center gap-2 px-0.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-forge-teal/10 text-forge-teal">
          <Link2 size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-none text-foreground">
            Share access
          </p>
          <p className="mt-1 text-micro leading-none text-muted-foreground/55">
            Keep this handy for late additions.
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-border/25 pt-3">
        <code className="min-w-0 flex-1 truncate text-xs font-semibold text-muted-foreground">
          {INVITE_LINK}
        </code>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label="Copy invite link"
          className={cn(
            "h-8 shrink-0 rounded-lg px-3 text-xs font-semibold transition-colors active:scale-[0.98]",
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
