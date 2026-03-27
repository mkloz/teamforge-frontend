import { cn } from "@/shared/lib/utils";
import { Check, RefreshCw, UserMinus, UserPlus } from "lucide-react";

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
  onRestoreParticipant: (id: string) => void;
  onReforge: () => void;
}

export function Step4Success({
  planName,
  participants,
  removedIds,
  onRemoveParticipant,
  onRestoreParticipant,
  onReforge,
}: Step4SuccessProps) {
  const activeCount = participants.filter((p) => !removedIds.has(p.id)).length + 1;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">

      {/* Hero success moment */}
      <div className="rounded-2xl bg-emerald-500/8 border border-emerald-500/20 p-5 flex items-center gap-4">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Check size={22} className="text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-emerald-600">Group forged</p>
          <h3 className="text-base font-bold text-foreground leading-tight mt-0.5 truncate">
            Ready for &ldquo;{planName}&rdquo;
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review your group below before continuing.
          </p>
        </div>
      </div>

      {/* Members section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Group members</p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600">{activeCount} people</span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Host */}
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <span className="text-[11px] font-bold text-primary-foreground">You</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">You (Host)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Group lead</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              Host
            </span>
          </div>

          {/* Participants */}
          {participants.map((p) => {
            const removed = removedIds.has(p.id);
            return (
              <div
                key={p.id}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200",
                  removed
                    ? "opacity-40 bg-muted/30 border-border/30 border-dashed"
                    : "bg-card border-border/40 hover:border-accent/30",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg transition-all duration-200",
                    removed
                      ? "bg-muted text-muted-foreground"
                      : "bg-accent/10 group-hover:bg-accent/15",
                  )}
                >
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-tight transition-colors",
                      removed ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {removed ? (
                      <p className="text-xs text-muted-foreground">Removed from session</p>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">Compatibility</p>
                        <span
                          className={cn(
                            "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                            p.compatibility >= 90
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-accent/10 text-accent",
                          )}
                        >
                          {p.compatibility}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {removed ? (
                  <button
                    type="button"
                    onClick={() => onRestoreParticipant(p.id)}
                    aria-label={`Restore ${p.name}`}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all duration-200"
                  >
                    <UserPlus size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(p.id)}
                    aria-label={`Remove ${p.name}`}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Recalculate CTA */}
        {removedIds.size > 0 && (
          <button
            type="button"
            onClick={onReforge}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-accent/30 bg-accent/5 text-accent text-sm font-semibold hover:bg-accent/10 transition-all duration-200 animate-in zoom-in-95"
          >
            <RefreshCw size={15} />
            Recalculate optimal balance
          </button>
        )}
      </div>

      {/* Contextual note */}
      <div className="flex gap-3 p-4 rounded-2xl border border-border/40 bg-card">
        <div className="w-0.5 rounded-full bg-primary/30 shrink-0 self-stretch" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-primary/80">How removal works</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Removing a participant queues them for future matching rather than blocking them. Use{" "}
            <span className="font-semibold text-accent">Recalculate</span> if the remaining balance feels off.
          </p>
        </div>
      </div>

    </div>
  );
}
