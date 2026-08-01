import { RefreshCw } from "lucide-react";

import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { StatusPill } from "@/shared/components/ui/status-pill";

import { ParticipantInviteSlots } from "./participant-invite-slots";
import { ParticipantRow } from "./participant-row";
import { getParticipantScorePercent } from "./participant-utils";

interface ParticipantsSectionProps {
  groupId: string | null;
  manualInviteeIds: string[];
  participants: ForgeParticipant[];
  removedIds: Set<string>;
  targetSize: number;
  onManualInviteeToggle: (id: string) => void;
  onRemoveParticipant: (id: string) => void;
  onRestoreParticipant: (id: string) => void;
  onReforge: () => void;
}

export function ParticipantsSection({
  groupId,
  manualInviteeIds,
  participants,
  removedIds,
  targetSize,
  onManualInviteeToggle,
  onRemoveParticipant,
  onRestoreParticipant,
  onReforge,
}: ParticipantsSectionProps) {
  const activeParticipants = participants.filter(
    (participant) => !removedIds.has(participant.userId),
  );
  const selectedCount = activeParticipants.length;
  const availableSeatCount = Math.max(0, targetSize - 1 - selectedCount);
  const plannedCount = selectedCount + manualInviteeIds.length + 1;
  const topParticipantId = getTopParticipantId(participants, removedIds);
  const participantIds = new Set(
    participants.map((participant) => participant.userId),
  );
  const activeParticipantIds = activeParticipants.map(
    (participant) => participant.userId,
  );

  return (
    <section
      aria-labelledby="matched-people-heading"
      className="flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3
            id="matched-people-heading"
            className="font-black text-foreground text-lg tracking-tight"
          >
            Your group lineup
          </h3>
          <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
            Keep the people TeamForge found, replace someone, or fill an open
            place with a friend.
          </p>
        </div>
        <StatusPill tone="neutral" size="sm" surface="soft" numeric>
          {plannedCount} of {targetSize}
        </StatusPill>
      </div>

      <GroupedMenuList aria-label="Group lineup">
        {participants.map((participant) => (
          <GroupedMenuItem
            key={participant.userId}
            className={
              removedIds.has(participant.userId) ? "bg-card/45" : undefined
            }
          >
            <ParticipantRow
              participant={participant}
              removed={removedIds.has(participant.userId)}
              highlight={topParticipantId === participant.userId}
              onRemoveParticipant={onRemoveParticipant}
              onRestoreParticipant={onRestoreParticipant}
            />
          </GroupedMenuItem>
        ))}
        <ParticipantInviteSlots
          availableSeatCount={availableSeatCount}
          groupId={groupId}
          groupMemberIds={activeParticipantIds}
          participantIds={participantIds}
          selectedInviteeIds={manualInviteeIds}
          onInviteeToggle={onManualInviteeToggle}
        />
      </GroupedMenuList>

      <div className="flex min-h-8 items-center justify-between gap-3 px-1">
        <p className="text-muted-foreground text-xs">
          {plannedCount === targetSize
            ? "Every place has someone planned."
            : `${targetSize - plannedCount} ${targetSize - plannedCount === 1 ? "place is" : "places are"} still open.`}
        </p>
        {removedIds.size > 0 ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={onReforge}
            className="shrink-0"
          >
            <RefreshCw aria-hidden="true" className="size-3.5" />
            Try another set
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function getTopParticipantId(
  participants: ForgeParticipant[],
  removedIds: Set<string>,
) {
  return participants.reduce<{ id: string; score: number } | null>(
    (best, participant) => {
      if (removedIds.has(participant.userId)) return best;

      const score = getParticipantScorePercent(participant);
      if (score === null) return best;

      return !best || score > best.score
        ? { id: participant.userId, score }
        : best;
    },
    null,
  )?.id;
}
