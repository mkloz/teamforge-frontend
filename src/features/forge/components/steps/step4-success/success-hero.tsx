import { Check, UsersRound } from "lucide-react";
import { ForgeGroupReadyVisual } from "@/features/forge/assets/forge-group-ready";
import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
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

interface ScoredParticipant {
  participant: ForgeParticipant;
  score: number;
}

function getActiveParticipants(
  participants: ForgeParticipant[],
  removedIds: Set<string>,
) {
  return participants.filter(
    (participant) => !removedIds.has(participant.userId),
  );
}

function getScoredParticipants(
  participants: ForgeParticipant[],
): ScoredParticipant[] {
  return participants
    .map((participant) => ({
      participant,
      score: getParticipantScorePercent(participant),
    }))
    .filter((item): item is ScoredParticipant => item.score !== null);
}

function getAverageScore(scoredParticipants: ScoredParticipant[]) {
  if (scoredParticipants.length === 0) {
    return null;
  }

  return Math.round(
    scoredParticipants.reduce((sum, item) => sum + item.score, 0) /
      scoredParticipants.length,
  );
}

function getTopFit(scoredParticipants: ScoredParticipant[]) {
  return scoredParticipants.reduce<ScoredParticipant | null>(
    (best, item) => (!best || item.score > best.score ? item : best),
    null,
  );
}

function getParticipantVisibility(participants: ForgeParticipant[]) {
  const visibleParticipants = participants.slice(0, 3);

  return {
    visibleParticipants,
    hiddenCount: Math.max(participants.length - visibleParticipants.length, 0),
  };
}

function getSuccessHeroDisplayTitle(planTitle: string) {
  return planTitle.trim() || "your plan";
}

export function SuccessHero({
  planTitle,
  participants,
  removedIds,
}: SuccessHeroProps) {
  const displayTitle = getSuccessHeroDisplayTitle(planTitle);
  const activeParticipants = getActiveParticipants(participants, removedIds);
  const scoredParticipants = getScoredParticipants(activeParticipants);
  const averageScore = getAverageScore(scoredParticipants);
  const topFit = getTopFit(scoredParticipants);

  return (
    <section className="overflow-hidden rounded-lg border border-border/40 bg-card/70">
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <IconTile
              icon={Check}
              tone="teal"
              size="lg"
              bordered
              iconClassName="size-5"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-muted-foreground text-xs">
                Group ready
              </p>
              <h3 className="mt-1 font-bold text-foreground text-xl leading-tight">
                {displayTitle} is ready.
              </h3>
              <p className="mt-1.5 text-muted-foreground text-sm leading-snug">
                Keep this group as-is, or remove someone before you continue.
              </p>
            </div>
          </div>

          <ForgeGroupReadyVisual className="mx-auto h-18 w-auto shrink-0 text-foreground sm:mx-0" />
        </div>

        <div className="flex items-center justify-between gap-3 border-border/35 border-y py-3">
          <SuccessHeroPeopleStack activeParticipants={activeParticipants} />

          <AverageFitStat averageScore={averageScore} />
        </div>

        <div
          className={cn(
            "grid gap-2 text-xs",
            topFit
              ? "grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]"
              : "grid-cols-1",
          )}
        >
          <TopFitSummary topFit={topFit} />
          <TopFitScorePill topFit={topFit} />
        </div>
      </div>
    </section>
  );
}

function SuccessHeroPeopleStack({
  activeParticipants,
}: {
  activeParticipants: ForgeParticipant[];
}) {
  const { hiddenCount, visibleParticipants } =
    getParticipantVisibility(activeParticipants);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex">
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
            className="-ml-2 size-8 rounded-lg border border-card bg-muted"
            fallbackClassName="bg-muted text-xs font-bold text-foreground/80"
          />
        ))}
        <HiddenParticipantCount hiddenCount={hiddenCount} />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-foreground text-sm leading-tight">
          {activeParticipants.length + 1} people
        </p>
        <p className="truncate text-muted-foreground text-xs">Hosted by you</p>
      </div>
    </div>
  );
}

function HiddenParticipantCount({ hiddenCount }: { hiddenCount: number }) {
  if (hiddenCount <= 0) {
    return null;
  }

  return (
    <div className="-ml-2 flex size-8 items-center justify-center rounded-lg border border-card bg-muted font-bold text-muted-foreground text-xs">
      +{hiddenCount}
    </div>
  );
}

function AverageFitStat({ averageScore }: { averageScore: number | null }) {
  return (
    <div className="flex shrink-0 items-center gap-2 text-right">
      <UsersRound size={15} className="text-forge-teal" />
      <div>
        <p className="font-bold text-foreground text-sm leading-tight">
          {getAverageFitLabel(averageScore)}
        </p>
        <p className="font-semibold text-micro text-muted-foreground">
          Average score
        </p>
      </div>
    </div>
  );
}

function getAverageFitLabel(averageScore: number | null) {
  return averageScore !== null ? `${averageScore}%` : "Ready";
}

function TopFitSummary({ topFit }: { topFit: ScoredParticipant | null }) {
  if (!topFit) {
    return (
      <p className="min-w-0 text-muted-foreground">
        The group is ready for review.
      </p>
    );
  }

  return (
    <p className="min-w-0 text-muted-foreground">
      Highest compatibility score:{" "}
      <span className="font-semibold text-foreground">
        {getParticipantName(topFit.participant)}
      </span>
      .
    </p>
  );
}

function TopFitScorePill({ topFit }: { topFit: ScoredParticipant | null }) {
  if (!topFit) {
    return null;
  }

  return (
    <StatusPill tone="amber" size="xs" numeric className="justify-self-start">
      {topFit.score}%
    </StatusPill>
  );
}
