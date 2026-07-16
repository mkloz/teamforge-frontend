import { Link } from "@tanstack/react-router";
import { ArrowRight, RefreshCcw } from "lucide-react";

import type { ForgeProposal } from "@/features/forge-proposals/public/proposal-review";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { buildForgeProposalNavigation } from "@/shared/navigation";

interface CurrentForgeProposalStatusProps {
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  proposal: ForgeProposal | null;
  showTransientState: boolean;
}

export function CurrentForgeProposalStatus({
  isError,
  isLoading,
  onRetry,
  proposal,
  showTransientState,
}: CurrentForgeProposalStatusProps) {
  if (proposal) {
    return <CurrentProposalSummary proposal={proposal} />;
  }

  if (!showTransientState) {
    return null;
  }

  if (isLoading) {
    return <CurrentProposalLoading />;
  }

  if (isError) {
    return <CurrentProposalError onRetry={onRetry} />;
  }

  return null;
}

function CurrentProposalSummary({ proposal }: { proposal: ForgeProposal }) {
  const view = getProposalView(proposal);

  if (!view) {
    return null;
  }

  return (
    <section
      className="grid gap-4"
      aria-labelledby="current-forge-proposal-heading"
    >
      <HomeSectionHeading
        id="current-forge-proposal-heading"
        eyebrow="Group proposal"
        title={proposal.activity.title}
        description={view.description}
      />

      <div className="flex flex-col gap-4 border-border/70 border-y py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="teal" surface="soft" size="sm">
            {view.label}
          </StatusPill>
          <StatusPill tone="neutral" surface="soft" size="sm">
            {proposal.scope === "LOCAL" ? "Local" : "Online"}
          </StatusPill>
          <StatusPill tone="neutral" surface="soft" size="sm">
            {getScheduleLabel(proposal)}
          </StatusPill>
        </div>

        <Button asChild className="w-fit">
          <Link {...view.navigation}>
            {view.actionLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function CurrentProposalLoading() {
  return (
    <section
      className="grid gap-4"
      aria-label="Loading group proposal"
      role="status"
    >
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-20 w-full" />
      <span className="sr-only">Loading group proposal...</span>
    </section>
  );
}

function CurrentProposalError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="grid gap-3" aria-label="Group proposal" role="alert">
      <p className="text-muted-foreground text-sm">
        Your current group proposal could not be refreshed.
      </p>
      <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
        <RefreshCcw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}

function getProposalView(proposal: ForgeProposal) {
  if (proposal.viewer.disposition !== "ACTIVE") {
    return null;
  }

  if (proposal.state === "FORMING") {
    return {
      actionLabel: "View status",
      description:
        "Your response is saved. The group space is being prepared now.",
      label: "Group forming",
      navigation: buildForgeProposalNavigation(proposal.id),
    };
  }

  if (proposal.viewer.decision === "ACCEPTED") {
    return {
      actionLabel: "View proposal",
      description:
        "Your response is saved. You can withdraw before the group forms.",
      label: "Response saved",
      navigation: buildForgeProposalNavigation(proposal.id),
    };
  }

  return {
    actionLabel: "Review proposal",
    description:
      "Review the activity and everyone in the proposal before you decide.",
    label: "Ready to review",
    navigation: buildForgeProposalNavigation(proposal.id),
  };
}

function getScheduleLabel(proposal: ForgeProposal) {
  if (proposal.scheduleMode === "TO_BE_DECIDED") {
    return "Decide together";
  }

  if (!proposal.dateTime) {
    return "Date set";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(proposal.dateTime));
}
