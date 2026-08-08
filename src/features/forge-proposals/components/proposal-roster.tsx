import { Info } from "lucide-react";
import { ProposalPersonalityDetails } from "@/features/forge-proposals/components/proposal-personality-details";
import { ProposalSeatSafetyActions } from "@/features/forge-proposals/components/proposal-seat-safety-actions";
import type {
  ForgeProposal,
  ForgeProposalSeat,
} from "@/features/forge-proposals/lib/forge-proposal-contract";
import {
  getCompatibilityExplanation,
  getSeatMeta,
} from "@/features/forge-proposals/lib/forge-proposal-presentation";
import { Avatar } from "@/shared/components/common/avatar";
import { StatusPill } from "@/shared/components/ui/status-pill";

interface ProposalRosterProps {
  proposal: ForgeProposal;
}

export function ProposalRoster({ proposal }: ProposalRosterProps) {
  return (
    <section aria-labelledby="proposal-roster-heading" className="py-8">
      <div className="max-w-2xl">
        <h2
          id="proposal-roster-heading"
          className="text-balance font-bold text-2xl text-foreground"
        >
          Proposed group
        </h2>
        <p className="mt-2 text-pretty text-muted-foreground text-sm leading-relaxed">
          {proposal.matchingStrategy === "INTRODUCTORY_INTERESTS"
            ? "This introductory group uses shared interests and practical plan constraints. It is not a compatibility assessment or a safety rating."
            : "Everyone sees the same roster. Compatibility below is only between you and each person; nobody can see other members’ responses. It is not a safety rating or a promise that the group will work."}
        </p>
      </div>

      <ul className="mt-6 divide-y divide-border/70 border-border/70 border-y">
        {proposal.seats.map((seat) => (
          <ProposalRosterSeat
            key={seat.seatId}
            seat={seat}
            proposalId={proposal.id}
            introductory={
              proposal.matchingStrategy === "INTRODUCTORY_INTERESTS"
            }
            isViewer={seat.seatId === proposal.viewer.seatId}
          />
        ))}
      </ul>
    </section>
  );
}

function ProposalRosterSeat({
  isViewer,
  proposalId,
  introductory,
  seat,
}: {
  isViewer: boolean;
  proposalId: string;
  introductory: boolean;
  seat: ForgeProposalSeat;
}) {
  const meta = getSeatMeta(seat);

  return (
    <li className="py-6">
      <div className="flex items-start gap-4">
        <Avatar
          src={seat.profile.avatar}
          name={seat.profile.name}
          imageSize={64}
          className="size-12 ring-1 ring-border/50 sm:size-14"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-base text-foreground">
                  {seat.profile.name}
                </h3>
                {isViewer ? (
                  <StatusPill tone="neutral" surface="soft" size="xs">
                    You
                  </StatusPill>
                ) : null}
                {seat.role === "REQUESTER" ? (
                  <StatusPill tone="teal" surface="soft" size="xs">
                    Started this plan
                  </StatusPill>
                ) : null}
              </div>
              {meta ? (
                <p className="mt-1 text-muted-foreground text-xs">{meta}</p>
              ) : null}
            </div>

            <SeatCompatibility seat={seat} isViewer={isViewer} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {seat.profile.personalityType ? (
              <StatusPill tone="teal" surface="outline" size="sm">
                {seat.profile.personalityType}
              </StatusPill>
            ) : null}
            {seat.profile.interests.slice(0, 4).map((interest) => (
              <StatusPill
                key={interest.id}
                tone="neutral"
                surface="soft"
                size="sm"
              >
                {interest.name}
              </StatusPill>
            ))}
          </div>

          {!introductory ? <ProposalPersonalityDetails seat={seat} /> : null}

          {!isViewer ? (
            <ProposalSeatSafetyActions proposalId={proposalId} seat={seat} />
          ) : null}
        </div>
      </div>
    </li>
  );
}

function SeatCompatibility({
  isViewer,
  seat,
}: {
  isViewer: boolean;
  seat: ForgeProposalSeat;
}) {
  if (isViewer || !seat.compatibilityWithViewer) {
    return (
      <p className="shrink-0 font-medium text-muted-foreground text-xs">
        Your profile
      </p>
    );
  }

  const compatibility = seat.compatibilityWithViewer;

  return (
    <div className="max-w-xs sm:text-right">
      <p className="font-bold text-foreground text-lg tabular-nums">
        {compatibility.score}/100 compatibility
      </p>
      <p className="mt-1 text-pretty text-muted-foreground text-xs leading-relaxed">
        <Info
          className="mr-1 inline size-3 text-foreground"
          aria-hidden="true"
          strokeWidth={2}
        />
        {getCompatibilityExplanation(compatibility.explanationCodes)}
      </p>
    </div>
  );
}
