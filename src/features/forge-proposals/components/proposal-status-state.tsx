import {
  CheckCircle2,
  CircleOff,
  Clock3,
  Inbox,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface ProposalStatusStateProps {
  action?: ReactNode;
  description: string;
  icon: typeof Inbox;
  title: string;
}

const factSkeletonIds = ["scope", "schedule", "size", "cost"] as const;
const rosterSkeletonIds = ["viewer", "seat-two", "seat-three"] as const;

function ProposalStatusState({
  action,
  description,
  icon,
  title,
}: ProposalStatusStateProps) {
  return (
    <section
      aria-labelledby="forge-proposal-state-heading"
      className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center"
    >
      <IconTile icon={icon} size="xl" tone="neutral" className="rounded-2xl" />
      <h1
        id="forge-proposal-state-heading"
        className="mt-5 text-balance font-bold text-2xl text-foreground"
      >
        {title}
      </h1>
      <p className="mt-2 max-w-sm text-pretty text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
      {action ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>
      ) : null}
    </section>
  );
}

export function ForgeProposalEmptyState({ action }: { action?: ReactNode }) {
  return (
    <ProposalStatusState
      icon={Inbox}
      title="No group to review"
      description="When a proposal is ready, you'll see the activity and everyone in the proposal here before you decide."
      action={action}
    />
  );
}

export function ForgeProposalExpiredState({ action }: { action?: ReactNode }) {
  return (
    <ProposalStatusState
      icon={Clock3}
      title="This proposal has ended"
      description="The response window has closed. This proposal is no longer available."
      action={action}
    />
  );
}

export function ForgeProposalUnavailableState({
  action,
}: {
  action?: ReactNode;
}) {
  return (
    <ProposalStatusState
      icon={CircleOff}
      title="This proposal is no longer available"
      description="It may have closed or your access may have changed."
      action={action}
    />
  );
}

export function ForgeProposalCompleteState({ action }: { action?: ReactNode }) {
  return (
    <ProposalStatusState
      icon={UsersRound}
      title="Your group has formed"
      description="This proposal is complete. Open the group to decide the remaining plan details together."
      action={action}
    />
  );
}

export function ForgeProposalResponseSavedState({
  action,
  decision,
}: {
  action?: ReactNode;
  decision: "DECLINED" | "WITHDRAWN";
}) {
  return (
    <ProposalStatusState
      icon={CheckCircle2}
      title="Your response is saved"
      description={
        decision === "WITHDRAWN"
          ? "You've withdrawn from this proposal. The other people in it won't see your response."
          : "You won't join this proposal. The other people in it won't see your response."
      }
      action={action}
    />
  );
}

export function ForgeProposalErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ProposalStatusState
      icon={CircleOff}
      title="We couldn't load this proposal"
      description="Check your connection and try again. If the proposal has closed, it will no longer be available when you reconnect."
      action={
        onRetry ? (
          <Button variant="primary" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}

export function ForgeProposalLoadingState() {
  return (
    <div
      className="mx-auto w-full max-w-4xl px-6 py-10"
      role="status"
      aria-label="Loading group proposal"
    >
      <Skeleton className="h-3 w-28" shape="pill" tone="teal" />
      <Skeleton className="mt-4 h-10 w-3/4" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      <div className="mt-8 grid gap-5 border-border/70 border-y py-6 sm:grid-cols-2">
        {factSkeletonIds.map((skeletonId) => (
          <div key={skeletonId} className="flex items-center gap-3">
            <Skeleton className="size-10" shape="square" />
            <div className="flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6">
        {rosterSkeletonIds.map((skeletonId) => (
          <div
            key={skeletonId}
            className="flex items-center gap-4 border-border/70 border-b pb-6"
          >
            <Skeleton className="size-14" shape="circle" />
            <div className="flex-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-2 h-4 w-56 max-w-full" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading group proposal...</span>
    </div>
  );
}
