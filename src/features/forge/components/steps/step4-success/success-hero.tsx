import { Check } from "lucide-react";
import { ForgeGroupReadyVisual } from "@/features/forge/assets/forge-group-ready";
import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { IconTile } from "@/shared/components/ui/icon-tile";
import {
  getParticipantInitials,
  getParticipantName,
} from "./participant-utils";

interface SuccessHeroProps {
  planTitle: string;
  participants: ForgeParticipant[];
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

export function SuccessHero({ planTitle, participants }: SuccessHeroProps) {
  const displayTitle = getSuccessHeroDisplayTitle(planTitle);

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
              <h3 className="font-bold text-foreground text-xl leading-tight">
                {displayTitle}
              </h3>
              <p className="mt-1.5 text-muted-foreground text-sm leading-snug">
                Review the members. You can remove someone before continuing.
              </p>
            </div>
          </div>

          <ForgeGroupReadyVisual className="mx-auto h-18 w-auto shrink-0 text-foreground sm:mx-0" />
        </div>

        <div className="flex items-center justify-between gap-3 border-border/35 border-y py-3">
          <SuccessHeroPeopleStack activeParticipants={participants} />
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
        <div className="flex size-8 items-center justify-center rounded-lg border border-card bg-forge-teal font-bold text-primary-foreground text-xs">
          You
        </div>
        {visibleParticipants.map((participant) => (
          <Avatar
            key={participant.userId}
            src={participant.user.avatar}
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
