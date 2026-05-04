import { Check, UsersRound } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";

import {
  getParticipantInitials,
  getParticipantName,
  getParticipantScorePercent,
} from "./participant-utils";
import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";

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
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Group ready
            </p>
            <h3 className="mt-1 text-xl font-bold leading-tight text-foreground">
              {displayTitle} has a lineup.
            </h3>
            <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
              Keep this group as-is, or remove someone before you continue.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-y border-border/35 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex -space-x-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-card bg-forge-teal text-micro font-bold text-primary-foreground">
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
                  fallbackClassName="bg-muted text-[10px] font-bold text-foreground/80"
                />
              ))}
              {hiddenCount > 0 && (
                <div className="flex size-8 items-center justify-center rounded-lg border border-card bg-muted text-[10px] font-bold text-muted-foreground">
                  +{hiddenCount}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {activeParticipants.length + 1} people
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Hosted by you
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-right">
            <UsersRound size={15} className="text-forge-teal" />
            <div>
              <p className="text-sm font-bold leading-tight text-foreground">
                {averageScore !== null ? `${averageScore}%` : "Ready"}
              </p>
              <p className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">
                Avg fit
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-2 text-xs",
            topFit ? "grid-cols-[1fr_auto]" : "grid-cols-1",
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
            <span className="font-bold tabular-nums text-spark-amber">
              {topFit.score}%
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
