import { cn } from "@/shared/lib/utils";
import { Check, Copy } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-12 gap-6 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-20 h-20 rounded-[2.5rem] bg-linear-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-inner">
            <Check size={32} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-emerald-600/60 transition-colors">
            Invitations sent!
          </p>
          <h3 className="text-xl font-black text-foreground tracking-tight">
            Your group is ready
          </h3>
          <p className="text-[11px] text-muted-foreground mt-2 max-w-70 leading-relaxed italic opacity-80">
            {participantCount - 1} invitation
            {participantCount - 1 !== 1 ? "s" : ""} have been sent out for{" "}
            <span className="text-foreground font-bold italic">
              "{planName}"
            </span>
            . You'll be notified as soon as they join.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Launch Summary Card */}
      <div className="group relative p-4 rounded-2xl bg-linear-to-br from-border/40 via-muted/10 to-transparent border border-border/50 shadow-xs overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
          <Check size={48} className="text-foreground" />
        </div>

        <div className="space-y-4 relative">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground/50">
              Group summary
            </p>
            <h4 className="text-base font-black text-foreground tracking-tight truncate">
              {planName}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
            <div className="space-y-1">
              <p className="text-[9px] font-black tracking-widest text-muted-foreground/50 uppercase">
                Members
              </p>
              <p className="text-[11px] font-black text-foreground">
                {participantCount} Confirmed
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold tracking-widest text-muted-foreground/40">
                Status
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black text-emerald-600 tracking-widest">
                  Verified
                </p>
              </div>
            </div>
          </div>

          <div className="flex -space-x-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center shrink-0 z-10 shadow-xs">
              <span className="text-[7px] font-black text-primary-foreground uppercase">
                You
              </span>
            </div>
            {Array.from({ length: Math.min(5, participantCount - 1) }).map(
              (_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500/20 to-emerald-500/10 border-2 border-background flex items-center justify-center z-0 shadow-xs"
                >
                  <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                </div>
              ),
            )}
            {participantCount > 6 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center z-0 shadow-xs">
                <span className="text-[7px] font-black text-muted-foreground">
                  +{participantCount - 6}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Access Key Section */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest px-1">
          Invite link
        </p>
        <div className="relative group">
          <div className="flex items-center gap-3 px-4 h-12 rounded-xl border border-border/50 bg-background/50 hover:bg-background transition-all group-hover:border-primary/20">
            <span className="flex-1 text-[10px] text-muted-foreground truncate font-medium tracking-tight">
              teamforge.app/join/grp_xk4j2m
            </span>
            <button
              type="button"
              onClick={onCopyLink}
              className={cn(
                "flex items-center gap-2 h-8 px-3 rounded-lg transition-all duration-300",
                inviteCopied
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-muted/50 text-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              {inviteCopied ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                <Copy size={12} strokeWidth={3} />
              )}
              <span className="text-[10px] font-black tracking-widest uppercase">
                Copied
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="group rounded-xl border border-border/50 bg-linear-to-br from-muted/5 to-transparent p-4 space-y-2 transition-all hover:border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-muted-foreground/20 group-hover:bg-primary transition-colors" />
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground/50 group-hover:text-primary/70">
            Reminder
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground leading-normal ml-3.5 italic opacity-80">
          Notifications are sent after your final confirmation.
        </p>
      </div>
    </div>
  );
}
