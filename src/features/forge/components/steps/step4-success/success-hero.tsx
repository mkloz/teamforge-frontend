import { Check, UsersRound } from "lucide-react";
import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import {
  getParticipantInitials,
  getParticipantName,
  getParticipantScorePercent,
} from "./participant-utils";

interface SuccessHeroProps {
  planTitle: string;
  participants: ForgeParticipant[];
  removedIds: Set<string>;
}

export function SuccessHero({
  planTitle,
  participants,
  removedIds,
}: SuccessHeroProps) {
  const displayTitle = planTitle.trim() || "your plan";
  const activeParticipants = participants.filter(
    (participant) => !removedIds.has(participant.userId),
  );
  const scoredParticipants = activeParticipants
    .map((participant) => ({
      participant,
      score: getParticipantScorePercent(participant),
    }))
    .filter(
      (item): item is { participant: ForgeParticipant; score: number } =>
        item.score !== null,
    );
  const averageScore =
    scoredParticipants.length > 0
      ? Math.round(
          scoredParticipants.reduce((sum, item) => sum + item.score, 0) /
            scoredParticipants.length,
        )
      : null;
  const topFit = scoredParticipants.reduce<{
    participant: ForgeParticipant;
    score: number;
  } | null>(
    (best, item) => (!best || item.score > best.score ? item : best),
    null,
  );
  const visibleParticipants = activeParticipants.slice(0, 3);
  const hiddenCount = Math.max(
    activeParticipants.length - visibleParticipants.length,
    0,
  );

  return (
    <section className="overflow-hidden rounded-lg border border-border/40 bg-card/70">
      <div className="space-y-4 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-forge-teal/25 bg-forge-teal/10 text-forge-teal">
            <Check size={20} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
              Group ready
            </p>
            <h3 className="mt-1 font-bold text-foreground text-xl leading-tight">
              {displayTitle} has a lineup.
            </h3>
            <p className="mt-1.5 text-muted-foreground text-sm leading-snug">
              Keep this group as-is, or remove someone before you continue.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-border/35 border-y py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex -space-x-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-card bg-forge-teal font-bold text-micro text-primary-foreground">
                You
              </div>
              {visibleParticipants.map((participant) => (
                <Avatar
                  key={participant.userId}
                  src={participant.user?.avatar}
                  name={getParticipantName(participant)}
                  fallback={getParticipantInitials(participant)}
                  shape="rounded"
                  className="size-8 rounded-lg border border-card bg-muted"
                  fallbackClassName="bg-muted text-xs font-bold text-foreground/80"
                />
              ))}
              {hiddenCount > 0 && (
                <div className="flex size-8 items-center justify-center rounded-lg border border-card bg-muted font-bold text-muted-foreground text-xs">
                  +{hiddenCount}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm leading-tight">
                {activeParticipants.length + 1} people
              </p>
              <p className="truncate text-muted-foreground text-xs">
                Hosted by you
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-right">
            <UsersRound size={15} className="text-forge-teal" />
            <div>
              <p className="font-bold text-foreground text-sm leading-tight">
                {averageScore !== null ? `${averageScore}%` : "Ready"}
              </p>
              <p className="font-semibold text-micro text-muted-foreground uppercase tracking-wide">
                Avg fit
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-2 text-xs",
            topFit ? "fluid-auto-grid" : "grid-cols-1",
          )}
        >
          <p className="min-w-0 text-muted-foreground">
            {topFit ? (
              <>
                Strongest fit is{" "}
                <span className="font-semibold text-foreground">
                  {getParticipantName(topFit.participant)}
                </span>
                .
              </>
            ) : (
              "The group is ready for review."
            )}
          </p>
          {topFit && (
            <span className="font-bold text-spark-amber tabular-nums">
              {topFit.score}%
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
