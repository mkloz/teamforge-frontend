import { RefreshCw, Users } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { HostMemberRow } from "./host-member-row";
import { ParticipantRow } from "./participant-row";
import { getParticipantScorePercent } from "./participant-utils";
import type { Step4SuccessProps } from "./types";

export function ParticipantsSection({
  participants,
  removedIds,
  onRemoveParticipant,
  onRestoreParticipant,
  onReforge,
}: Omit<Step4SuccessProps, "planTitle">) {
  const activeCount =
    participants.filter((participant) => !removedIds.has(participant.userId))
      .length + 1;
  const topParticipantId = participants.reduce<{
    id: string;
    score: number;
  } | null>((best, participant) => {
    if (removedIds.has(participant.userId)) {
      return best;
    }

    const score = getParticipantScorePercent(participant);

    if (score === null) {
      return best;
    }

    return !best || score > best.score
      ? { id: participant.userId, score }
      : best;
  }, null)?.id;

  return (
    <section className="flex flex-col gap-3 border-border/25 border-t pt-4">
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-forge-teal/10 text-forge-teal">
            <Users size={14} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-none">
              Matched people
            </p>
            <p className="mt-1 text-micro text-muted-foreground/55 leading-none">
              Review the list before continuing.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 rounded-full border border-border/45 bg-muted/40 px-2.5 py-1">
          <span className="font-semibold text-muted-foreground text-xs">
            {activeCount} people
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <HostMemberRow />

        {participants.map((participant) => (
          <ParticipantRow
            key={participant.userId}
            participant={participant}
            removed={removedIds.has(participant.userId)}
            highlight={topParticipantId === participant.userId}
            onRemoveParticipant={onRemoveParticipant}
            onRestoreParticipant={onRestoreParticipant}
          />
        ))}
      </div>

      {removedIds.size > 0 && (
        <Button
          variant="secondary"
          onClick={onReforge}
          className="w-full py-5 font-semibold"
        >
          <RefreshCw size={15} />
          Try another set
        </Button>
      )}
    </section>
  );
}
