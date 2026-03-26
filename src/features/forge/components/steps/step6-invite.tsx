import { cn } from "@/shared/lib/utils";
import { Check, Copy, Send, Users } from "lucide-react";

export interface Step6InviteProps {
  planName: string;
  participantCount: number;
  inviteCopied: boolean;
  onCopyLink: () => void;
  invitesSent: boolean;
}

export function Step6Invite({
  planName,
  participantCount,
  inviteCopied,
  onCopyLink,
  invitesSent,
}: Step6InviteProps) {
  if (invitesSent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center animate-in fade-in zoom-in-95 duration-500">
        {/* Success icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-[1.75rem] bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/25">
            <Check size={36} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
          </span>
        </div>

        <div className="space-y-2 max-w-xs">
          <p className="text-xs font-semibold text-emerald-600">Invitations sent</p>
          <h3 className="text-xl font-bold text-foreground tracking-tight">
            Your group is live!
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {participantCount - 1} invitation{participantCount - 1 !== 1 ? "s" : ""}{" "}
            sent for{" "}
            <span className="font-semibold text-foreground">&ldquo;{planName}&rdquo;</span>.
            You&apos;ll be notified as each member joins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">

      {/* Group summary card */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-muted-foreground">Group summary</p>
          <h4 className="text-base font-bold text-foreground truncate">{planName}</h4>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-semibold text-foreground">{participantCount} confirmed</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Check size={14} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-semibold text-emerald-600">Verified</p>
            </div>
          </div>
        </div>

        {/* Avatar stack */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary border-2 border-card flex items-center justify-center z-10 shadow-sm">
              <span className="text-[10px] font-bold text-primary-foreground">You</span>
            </div>
            {Array.from({ length: Math.min(5, participantCount - 1) }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-emerald-500/15 border-2 border-card z-0 shadow-sm"
                style={{ zIndex: 9 - i }}
              />
            ))}
            {participantCount > 6 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center z-0 shadow-sm">
                <span className="text-[10px] font-bold text-muted-foreground">
                  +{participantCount - 6}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{participantCount} members ready</p>
        </div>
      </div>

      {/* Invite link */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground">Share invite link</p>
        <div className="flex items-center gap-2 px-4 h-13 rounded-2xl border border-border/50 bg-card">
          <span className="flex-1 text-sm text-muted-foreground truncate">
            teamforge.app/join/grp_xk4j2m
          </span>
          <button
            type="button"
            onClick={onCopyLink}
            aria-label="Copy invite link"
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0",
              inviteCopied
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "bg-muted text-foreground hover:bg-primary/10 hover:text-primary",
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
          </button>
        </div>
      </div>

      {/* Send invites section */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground">Notify members</p>
        <div className="flex gap-3 p-4 rounded-2xl border border-border/40 bg-card">
          <Send size={16} className="text-primary/60 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">Send invitations</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tapping{" "}
              <span className="font-semibold text-foreground">Confirm &amp; send</span>{" "}
              below will notify all {participantCount - 1} members and create your group.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
