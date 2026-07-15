import { RefreshCw, Users } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";

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
          <IconTile icon={Users} tone="teal" size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-none">
              Selected people
            </p>
            <p className="mt-1 text-micro text-muted-foreground/55 leading-none">
              Review the list before continuing.
            </p>
          </div>
        </div>
        <StatusPill tone="neutral" size="sm" surface="soft">
          {activeCount} people
        </StatusPill>
      </div>

      <div className="flex flex-col">
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
