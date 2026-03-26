import { cn } from "@/shared/lib/utils";
import { Check, RefreshCw, Sparkles, UserMinus } from "lucide-react";

export interface Step4SuccessProps {
  planName: string;
  activity: string;
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
    compatibility: number;
  }>;
  removedIds: Set<string>;
  onRemoveParticipant: (id: string) => void;
  onReforge: () => void;
}

export function Step4Success({
  planName,
  participants,
  removedIds,
  onRemoveParticipant,
  onReforge,
}: Step4SuccessProps) {
  const activeCount =
    participants.filter((p) => !removedIds.has(p.id)).length + 1;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Success Indicator Section */}
      <div className="relative p-5 rounded-2xl bg-linear-to-br from-emerald-500/10 via-emerald-500/2 to-transparent border border-emerald-500/20 shadow-xs overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none animate-pulse">
          <Sparkles size={40} className="text-emerald-500" />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Check size={24} className="text-white" strokeWidth={3} />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold tracking-widest text-emerald-600/60 uppercase">
              Success!
            </p>
            <h3 className="text-base font-black text-foreground leading-tight tracking-tight">
              Found a group for you
            </h3>
            <p className="text-[9px] text-muted-foreground font-medium italic opacity-80">
              Ready for "{planName}"
            </p>
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest">
            Group members
          </p>
          <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10">
            <span className="text-[9px] font-bold text-emerald-600 tracking-widest uppercase">
              {activeCount} people
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          {/* Host Card */}
          <div className="relative group flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-primary/10 to-transparent border border-primary/20 shadow-xs transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 relative">
              <span className="text-[10px] font-black text-primary-foreground italic">
                YOU
              </span>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-background border border-primary flex items-center justify-center shadow-sm">
                <span className="text-[9px] grayscale brightness-150">👑</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black tracking-tight text-foreground leading-none">
                You (Host)
              </p>
              <p className="text-[9px] text-muted-foreground/50 font-bold mt-1 tracking-widest italic uppercase">
                Group Lead
              </p>
            </div>
            <div className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-[8px] font-bold text-primary tracking-widest uppercase">
                HOST
              </span>
            </div>
          </div>

          {/* Participant Cards */}
          {participants.map((p) => {
            const removed = removedIds.has(p.id);
            return (
              <div
                key={p.id}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300",
                  removed
                    ? "opacity-40 grayscale bg-muted/20 border-border/50 border-dashed"
                    : "bg-background border-border/50 hover:border-accent/30 hover:bg-accent/2 hover:shadow-sm",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xl font-black italic shadow-xs transition-all duration-300",
                    removed
                      ? "bg-muted text-muted-foreground"
                      : "bg-accent/10 text-accent group-hover:scale-105 group-hover:rotate-1",
                  )}
                >
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-black tracking-tight leading-none transition-colors",
                      removed
                        ? "text-muted-foreground line-through"
                        : "text-foreground group-hover:text-accent",
                    )}
                  >
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[9px] text-muted-foreground/50 font-medium italic">
                      {removed ? "Removed from session" : "Compatibility:"}
                    </p>
                    {!removed && (
                      <span
                        className={cn(
                          "text-[9px] font-bold tabular-nums transition-colors px-1.5 py-0.5 rounded-lg border",
                          p.compatibility >= 90
                            ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-500"
                            : "bg-accent/10 border-accent/10 text-accent",
                        )}
                      >
                        {p.compatibility}%
                      </span>
                    )}
                  </div>
                </div>
                {!removed && (
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(p.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-background border border-border/50 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:border-destructive hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm"
                  >
                    <UserMinus size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {removedIds.size > 0 && (
          <button
            type="button"
            onClick={onReforge}
            className="mt-4 w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border border-dashed border-accent/40 bg-accent/3 text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent/5 transition-all animate-in zoom-in-95 duration-300"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            Recalculate Optimal Balance
          </button>
        )}
      </div>

      {/* Helpful Hint */}
      <div className="group rounded-xl border border-primary/20 bg-linear-to-br from-primary/3 to-transparent p-4 space-y-2 shadow-xs transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
          <p className="text-[10px] font-bold tracking-widest text-primary/80">
            Note
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal italic">
          Removing a participant queues them for future matching instead of
          excluding. Use{" "}
          <span className="font-bold text-accent">Recalculate</span> if you're
          unhappy with the remaining balance.
        </p>
      </div>
    </div>
  );
}
