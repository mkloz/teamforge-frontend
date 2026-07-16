import { Users } from "lucide-react";

import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";

import { HostMemberRow } from "./host-member-row";
import { ParticipantRow } from "./participant-row";
import type { Step4SuccessProps } from "./types";

export function ParticipantsSection({
  participants,
}: Omit<Step4SuccessProps, "planTitle">) {
  const activeCount = participants.length + 1;

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
          <ParticipantRow key={participant.userId} participant={participant} />
        ))}
      </div>
    </section>
  );
}
