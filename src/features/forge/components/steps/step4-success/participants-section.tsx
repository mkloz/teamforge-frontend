import { RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { HostMemberRow } from "./host-member-row";
import { ParticipantRow } from "./participant-row";
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">
          Group members
        </p>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forge-teal/10 border border-forge-teal/15">
          <span className="w-1.5 h-1.5 rounded-full bg-forge-teal" />
          <span className="text-xs font-semibold text-forge-teal">
            {activeCount} people
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <HostMemberRow />

        {participants.map((participant) => (
          <ParticipantRow
            key={participant.userId}
            participant={participant}
            removed={removedIds.has(participant.userId)}
            onRemoveParticipant={onRemoveParticipant}
            onRestoreParticipant={onRestoreParticipant}
          />
        ))}
      </div>

      {removedIds.size > 0 && (
        <Button
          variant="outline"
          onClick={onReforge}
          className="w-full py-6 rounded-2xl border-dashed border-accent/30 bg-accent/5 text-accent font-semibold hover:bg-accent/10 shadow-none hover:shadow-none animate-in zoom-in-95"
        >
          <RefreshCw size={15} />
          Recalculate optimal balance
        </Button>
      )}
    </div>
  );
}
