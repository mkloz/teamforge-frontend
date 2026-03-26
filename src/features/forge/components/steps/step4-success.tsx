import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, UserMinus, UserPlus, Zap } from "lucide-react";

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

// Deterministic gradient per participant index for cover strip variety
const MEMBER_GRADIENTS = [
  "from-teal-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
  "from-sky-400 to-blue-500",
];

export function Step4Success({
  planName,
  participants,
  removedIds,
  onRemoveParticipant,
  onReforge,
}: Step4SuccessProps) {
  const activeCount = participants.filter((p) => !removedIds.has(p.id)).length + 1;
  const removedCount = removedIds.size;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-4">

      {/* ── "Group Forged" app-style hero ── */}
      <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5">
        {/* Decorative background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative p-5 flex flex-col gap-4">
          {/* Top row: icon + badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap size={20} className="text-primary-foreground fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">Group forged</span>
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground leading-tight mt-0.5 max-w-[200px] truncate">
                  &ldquo;{planName}&rdquo;
                </h3>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-2xl font-black text-primary tabular-nums leading-none">
                {activeCount}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                members
              </span>
            </div>
          </div>

          {/* Avatar strip — profile-header style */}
          <div className="flex items-center">
            {/* Host */}
            <div className="w-10 h-10 rounded-full border-2 border-background bg-primary flex items-center justify-center shadow-md z-10 shrink-0">
              <span className="text-[10px] font-bold text-primary-foreground">You</span>
            </div>
            {/* Participant avatars */}
            {participants
              .filter((p) => !removedIds.has(p.id))
              .slice(0, 5)
              .map((p, i) => (
                <div
                  key={p.id}
                  className="w-10 h-10 rounded-full border-2 border-background flex items-center justify-center shadow-md text-base -ml-2 shrink-0"
                  style={{ zIndex: 9 - i, backgroundColor: "hsl(var(--muted))" }}
                >
                  {p.avatar}
                </div>
              ))}
            {activeCount > 6 && (
              <div
                className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center shadow-md -ml-2 shrink-0"
                style={{ zIndex: 3 }}
              >
                <span className="text-[10px] font-bold text-muted-foreground">
                  +{activeCount - 6}
                </span>
              </div>
            )}
            <p className="ml-3 text-xs text-muted-foreground leading-snug">
              Review and adjust below before continuing.
            </p>
          </div>
        </div>
      </div>

      {/* ── Members section ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Group members</p>
          {removedCount > 0 && (
            <span className="text-xs text-muted-foreground/60">
              {removedCount} removed — tap to re-add
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {/* Host card */}
          <div className="relative rounded-2xl overflow-hidden border border-primary/20">
            {/* Cover strip with name overlay */}
            <div className="h-14 bg-gradient-to-br from-primary/30 to-primary/10 relative">
              <div className="absolute inset-0 flex items-center px-4">
                <p className="text-sm font-bold text-primary">You (Host)</p>
              </div>
            </div>
            {/* Description overlay */}
            <div className="bg-card px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary -mt-6 border-2 border-card flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-[9px] font-bold text-primary-foreground">You</span>
                </div>
                <p className="text-xs text-muted-foreground">Group lead · Host</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shrink-0">
                Host
              </span>
            </div>
          </div>

          {/* Participant cards */}
          <AnimatePresence initial={false}>
            {participants.map((p, idx) => {
              const removed = removedIds.has(p.id);
              const gradient = MEMBER_GRADIENTS[idx % MEMBER_GRADIENTS.length];
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: removed ? 0.45 : 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "relative rounded-2xl overflow-hidden border transition-all duration-200",
                    removed
                      ? "border-dashed border-border/40"
                      : "border-border/40 hover:border-accent/30",
                  )}
                >
                  {/* Cover image area — name overlaid */}
                  <div className={cn("h-14 bg-gradient-to-br relative", gradient)}>
                    <div className="absolute inset-0 flex items-center px-4">
                      <p
                        className={cn(
                          "text-sm font-bold text-white drop-shadow-sm",
                          removed && "line-through opacity-60",
                        )}
                      >
                        {p.name}
                      </p>
                    </div>
                    {/* Remove / Re-add button top-right */}
                    <button
                      type="button"
                      onClick={() => onRemoveParticipant(p.id)}
                      aria-label={removed ? `Re-add ${p.name}` : `Remove ${p.name}`}
                      className={cn(
                        "absolute top-2.5 right-2.5 flex items-center gap-1.5 h-7 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                        removed
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-black/20 text-white hover:bg-destructive/80 backdrop-blur-sm",
                      )}
                    >
                      {removed ? (
                        <><UserPlus size={11} strokeWidth={2.5} />Re-add</>
                      ) : (
                        <><UserMinus size={11} strokeWidth={2.5} />Remove</>
                      )}
                    </button>
                  </div>

                  {/* Description row — bg-colored overlay */}
                  <div className="bg-card px-4 py-2.5 flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl -mt-6 border-2 border-card flex items-center justify-center shadow-sm shrink-0 text-base bg-gradient-to-br",
                        gradient,
                      )}
                    >
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      {removed ? (
                        <p className="text-xs text-muted-foreground">Removed from group</p>
                      ) : (
                        <div className="flex items-center gap-2">
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
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Recalculate CTA */}
        <AnimatePresence>
          {removedIds.size > 0 && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              type="button"
              onClick={onReforge}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-accent/30 bg-accent/5 text-accent text-sm font-semibold hover:bg-accent/10 transition-all duration-200"
            >
              <RefreshCw size={15} />
              Recalculate optimal balance
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Contextual note */}
      <div className="flex gap-3 p-4 rounded-2xl border border-border/40 bg-card">
        <div className="w-0.5 rounded-full bg-primary/30 shrink-0 self-stretch" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-primary/80">How removal works</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Removed members are queued for future matching, not blocked. Tap{" "}
            <span className="font-semibold text-primary">Re-add</span> to restore anyone,
            or use <span className="font-semibold text-accent">Recalculate</span> to rebalance the group.
          </p>
        </div>
      </div>
    </div>
  );
}
