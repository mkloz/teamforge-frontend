import { CalendarClock, Laptop, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { ProposalFacts } from "@/features/group-proposals/components/proposal-facts";
import { ProposalRoster } from "@/features/group-proposals/components/proposal-roster";
import type {
  GroupProposal,
  GroupProposalSeatDecision,
  GroupProposalSeatDisposition,
  GroupProposalState,
} from "@/features/group-proposals/lib/group-proposal-contract";
import { formatProposalDeadline } from "@/features/group-proposals/lib/group-proposal-presentation";
import { StatusPill } from "@/shared/components/ui/status-pill";

export interface GroupProposalActionContext {
  deadlineAt: string;
  policyVersion: GroupProposal["policyVersion"];
  proposalId: string;
  proposalState: GroupProposalState;
  proposalVersion: number;
  scheduleMode: GroupProposal["scheduleMode"];
  scope: GroupProposal["scope"];
  viewerDecision: GroupProposalSeatDecision;
  viewerDecisionRevision: number;
  viewerDisposition: GroupProposalSeatDisposition;
  viewerSeatId: string;
}

export type GroupProposalActionSlot = (
  context: GroupProposalActionContext,
) => ReactNode;

interface GroupProposalReviewProps {
  actionSlot?: GroupProposalActionSlot;
  proposal: GroupProposal;
}

export function GroupProposalReview({
  actionSlot,
  proposal,
}: GroupProposalReviewProps) {
  const actionContext = getActionContext(proposal);
  const actions = actionSlot?.(actionContext);

  return (
    <article
      aria-labelledby="group-proposal-heading"
      className="mx-auto w-full max-w-4xl px-6 py-8 sm:py-10"
    >
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            icon={proposal.scope === "LOCAL" ? MapPin : Laptop}
            tone="neutral"
            surface="soft"
            size="sm"
          >
            {proposal.scope === "LOCAL" ? "Local" : "Online"}
          </StatusPill>
          <StatusPill
            icon={CalendarClock}
            tone="neutral"
            surface="soft"
            size="sm"
          >
            {proposal.scheduleMode === "TO_BE_DECIDED"
              ? "Decide together"
              : "Date set"}
          </StatusPill>
        </div>

        <h1
          id="group-proposal-heading"
          className="mt-3 text-balance font-extrabold text-3xl text-foreground leading-tight sm:text-4xl"
        >
          {proposal.activity.title}
        </h1>
        {proposal.activity.description ? (
          <p className="mt-3 max-w-2xl text-pretty text-base text-muted-foreground leading-relaxed">
            {proposal.activity.description}
          </p>
        ) : null}

        {proposal.activity.interests.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {proposal.activity.interests.map((interest) => (
              <StatusPill
                key={interest.id}
                tone="teal"
                surface="soft"
                size="sm"
              >
                {interest.name}
              </StatusPill>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mt-8">
        <ProposalFacts proposal={proposal} />
        <ProposalRoster proposal={proposal} />
      </div>

      <footer className="border-border/70 border-t pt-6">
        <ProposalDecisionNotice proposal={proposal} />
        {actions ? (
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {actions}
          </div>
        ) : null}
      </footer>
    </article>
  );
}

function getActionContext(proposal: GroupProposal): GroupProposalActionContext {
  return {
    deadlineAt: proposal.deadlineAt,
    policyVersion: proposal.policyVersion,
    proposalId: proposal.id,
    proposalState: proposal.state,
    proposalVersion: proposal.version,
    scheduleMode: proposal.scheduleMode,
    scope: proposal.scope,
    viewerDecision: proposal.viewer.decision,
    viewerDecisionRevision: proposal.viewer.decisionRevision,
    viewerDisposition: proposal.viewer.disposition,
    viewerSeatId: proposal.viewer.seatId,
  };
}

function ProposalDecisionNotice({ proposal }: { proposal: GroupProposal }) {
  if (proposal.recovery?.viewerStatus === "ORGANIZER_ACTION") {
    return (
      <DecisionText
        title="The original proposal ended one person short"
        description="No smaller group was created. You can decide whether to open one public place, then the final roster will return here for everyone to review."
      />
    );
  }

  if (proposal.state === "FORMING") {
    return (
      <DecisionText
        title="The group is being created"
        description="Your response is saved. We will update this page when the shared space is ready."
      />
    );
  }

  if (proposal.viewer.decision === "ACCEPTED") {
    return (
      <DecisionText
        title="Your response is saved"
        description={`You can withdraw before the group forms. This proposal closes ${formatProposalDeadline(proposal.deadlineAt)}.`}
      />
    );
  }

  return <DecisionText title="Nothing is created until everyone accepts." />;
}

function DecisionText({
  description,
  title,
}: {
  description?: string;
  title: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-bold text-foreground text-sm">{title}</p>
      {description ? (
        <p className="mt-1 text-pretty text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
