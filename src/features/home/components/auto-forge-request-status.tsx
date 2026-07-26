import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Pause, RefreshCcw, Search, X } from "lucide-react";
import {
  type AutoForgeRequest,
  clearAutoForgeRequestWizardDraft,
  saveAutoForgeRequestAsWizardDraft,
  useAutoForgeRequest,
} from "@/features/forge/public/auto-forge-request";
import {
  type CurrentForgeProposalResponse,
  forgeProposalQueries,
} from "@/features/forge-proposals/public/proposal-review";
import { CurrentForgeProposalStatus } from "@/features/home/components/current-forge-proposal-status";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import {
  buildForgeLaunchNavigation,
  buildForgeNavigation,
  buildForgeProposalNavigation,
} from "@/shared/navigation";

type CurrentForgeProposalQuery = UseQueryResult<CurrentForgeProposalResponse>;

export function AutoForgeRequestStatus() {
  const state = useAutoForgeRequest();
  const proposalQuery = useQuery(forgeProposalQueries.current());

  if (state.isLoading) {
    return (
      <section className="grid gap-3" aria-label="Forge request" role="status">
        <div className="h-6 w-48 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
        <span className="sr-only">Loading your Forge request</span>
      </section>
    );
  }

  if (state.isStateError && !state.request) {
    return (
      <div className="grid gap-8">
        <StandaloneProposalStatus proposalQuery={proposalQuery} />
        <section
          id="forge-request-heading"
          className="grid gap-3"
          aria-label="Forge request"
          role="alert"
        >
          <p className="text-muted-foreground text-sm">
            Your current Forge request could not be refreshed.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={state.onRetryStatus}
          >
            <RefreshCcw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </section>
      </div>
    );
  }

  if (!state.request) {
    return <StandaloneProposalStatus proposalQuery={proposalQuery} />;
  }

  const shouldShowStandaloneProposal = state.request.lifecycle !== "PROPOSED";

  return (
    <div className="grid gap-8">
      {shouldShowStandaloneProposal ? (
        <StandaloneProposalStatus
          proposalQuery={proposalQuery}
          request={state.request}
        />
      ) : null}
      <RequestStatusCard
        proposalQuery={proposalQuery}
        request={state.request}
        state={state}
      />
    </div>
  );
}

function StandaloneProposalStatus({
  proposalQuery,
  request,
}: {
  proposalQuery: CurrentForgeProposalQuery;
  request?: AutoForgeRequest;
}) {
  const showTransientState =
    !request ||
    (request.lifecycle === "PAUSED" &&
      request.pauseReason === "CANDIDATE_SEAT");

  return (
    <CurrentForgeProposalStatus
      isError={proposalQuery.isError}
      isLoading={proposalQuery.isPending}
      onRetry={() => void proposalQuery.refetch()}
      proposal={proposalQuery.data?.proposal ?? null}
      showTransientState={showTransientState}
    />
  );
}

function RequestStatusCard({
  proposalQuery,
  request,
  state,
}: {
  proposalQuery: CurrentForgeProposalQuery;
  request: AutoForgeRequest;
  state: ReturnType<typeof useAutoForgeRequest>;
}) {
  const view = getRequestView(request);
  const actionDisabled =
    !state.isOnline || state.isStateError || state.activeAction !== null;

  return (
    <section className="grid gap-4" aria-labelledby="forge-request-heading">
      <HomeSectionHeading
        id="forge-request-heading"
        title={request.activity.title}
        description={view.description}
      />

      <div className="grid gap-5 border-border/70 border-y py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusPill
            size="sm"
            tone={
              request.lifecycle === "SEARCHING" ||
              request.lifecycle === "PROPOSED"
                ? "teal"
                : "muted"
            }
            surface="soft"
          >
            {view.label}
          </StatusPill>
          <p className="text-muted-foreground text-xs">
            {request.scope === "LOCAL" ? "Local activity" : "Online activity"}
            {" · "}
            {request.plan.scheduleMode === "FIXED"
              ? formatDate(request.plan.dateTime)
              : "Date and time to be decided"}
          </p>
        </div>

        <RequestTiming request={request} />

        {state.error ? (
          <div className="flex flex-wrap items-center gap-3" role="alert">
            <p className="text-destructive text-sm">{state.error}</p>
            {state.isStateError ? (
              <Button variant="outline" size="sm" onClick={state.onRetryStatus}>
                Refresh status
              </Button>
            ) : null}
          </div>
        ) : null}

        {!state.isOnline ? (
          <p className="text-muted-foreground text-sm">
            Reconnect before changing this request.
          </p>
        ) : null}

        <RequestActions
          actionDisabled={actionDisabled}
          proposalQuery={proposalQuery}
          request={request}
          state={state}
        />
      </div>
    </section>
  );
}

function RequestTiming({ request }: { request: AutoForgeRequest }) {
  if (request.lifecycle !== "SEARCHING") return null;

  return (
    <dl className="grid border-border/70 border-y text-sm sm:grid-cols-2">
      <div className="grid gap-1 py-3 sm:pr-5">
        <dt className="text-muted-foreground text-xs">Last check</dt>
        <dd className="font-medium text-foreground">
          {request.lastAttemptAt
            ? formatDate(request.lastAttemptAt)
            : "Not checked yet"}
        </dd>
      </div>
      <div className="grid gap-1 border-border/70 border-t py-3 sm:border-t-0 sm:border-l sm:pl-5">
        <dt className="text-muted-foreground text-xs">Next scheduled check</dt>
        <dd className="font-medium text-foreground">
          {request.nextAttemptAt
            ? formatDate(request.nextAttemptAt)
            : "Not scheduled yet"}
        </dd>
      </div>
    </dl>
  );
}

function RequestActions({
  actionDisabled,
  proposalQuery,
  request,
  state,
}: {
  actionDisabled: boolean;
  proposalQuery: CurrentForgeProposalQuery;
  request: AutoForgeRequest;
  state: ReturnType<typeof useAutoForgeRequest>;
}) {
  if (request.lifecycle === "DRAFT") {
    return (
      <div className="flex flex-wrap gap-3">
        <EditRequestLink request={request} label="Review and start" />
        <CancelRequestAction disabled={actionDisabled} state={state} />
      </div>
    );
  }

  if (request.lifecycle === "SEARCHING") {
    return (
      <div className="flex flex-wrap gap-3">
        <EditRequestLink request={request} label="Edit request" />
        <Button
          variant="outline"
          disabled={actionDisabled}
          loading={state.activeAction === "pause"}
          onClick={state.onPause}
        >
          <Pause className="size-4" aria-hidden="true" />
          Pause search
        </Button>
        <Button
          variant="outline"
          disabled={actionDisabled || !request.canRetryNow}
          loading={state.activeAction === "retry"}
          onClick={state.onRetryNow}
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Check now
        </Button>
        {!request.canRetryNow && request.manualRetryAvailableAt ? (
          <p className="basis-full text-muted-foreground text-xs">
            You can check again after{" "}
            {formatDate(request.manualRetryAvailableAt)}.
          </p>
        ) : null}
        <CancelRequestAction disabled={actionDisabled} state={state} />
      </div>
    );
  }

  if (request.lifecycle === "PAUSED" && request.pauseReason === "USER") {
    return (
      <div className="flex flex-wrap gap-3">
        <EditRequestLink request={request} label="Edit request" />
        <Button
          disabled={actionDisabled}
          loading={state.activeAction === "resume"}
          onClick={state.onResume}
        >
          <Search className="size-4" aria-hidden="true" />
          Resume search
        </Button>
        <CancelRequestAction disabled={actionDisabled} state={state} />
      </div>
    );
  }

  if (
    request.lifecycle === "PAUSED" &&
    request.pauseReason === "AUTOMATIC_RETRY_FAILURE"
  ) {
    return (
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={actionDisabled}
          loading={state.activeAction === "resume"}
          onClick={state.onResume}
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
        <CancelRequestAction disabled={actionDisabled} state={state} />
      </div>
    );
  }

  if (
    request.lifecycle === "PAUSED" &&
    request.pauseReason === "PROPOSAL_ENDED"
  ) {
    return (
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={actionDisabled}
          loading={state.activeAction === "resume"}
          onClick={state.onResume}
        >
          <Search className="size-4" aria-hidden="true" />
          Keep looking
        </Button>
        <CancelRequestAction disabled={actionDisabled} state={state} />
      </div>
    );
  }

  if (request.lifecycle === "PAUSED") {
    return <CancelRequestAction disabled={actionDisabled} state={state} />;
  }

  if (request.lifecycle === "EXPIRED") {
    return (
      <Button asChild className="w-fit">
        <Link
          {...buildForgeLaunchNavigation()}
          onClick={() => clearAutoForgeRequestWizardDraft(request.id)}
        >
          Start a new request
        </Link>
      </Button>
    );
  }

  if (request.lifecycle === "PROPOSED") {
    return (
      <ProposedRequestAction
        proposalQuery={proposalQuery}
        requestId={request.id}
      />
    );
  }

  return null;
}

function ProposedRequestAction({
  proposalQuery,
  requestId,
}: {
  proposalQuery: CurrentForgeProposalQuery;
  requestId: string;
}) {
  if (proposalQuery.isPending) {
    return (
      <Button className="w-fit" loading disabled>
        Loading proposal
      </Button>
    );
  }

  if (proposalQuery.isError) {
    return (
      <div className="flex flex-wrap items-center gap-3" role="alert">
        <p className="text-muted-foreground text-sm">
          The group proposal could not be refreshed.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void proposalQuery.refetch()}
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  const proposal = proposalQuery.data?.proposal;

  if (!proposal || proposal.requestId !== requestId) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-muted-foreground text-sm">
          The review is still being prepared. Check again in a moment.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void proposalQuery.refetch()}
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Check again
        </Button>
      </div>
    );
  }

  return (
    <Button asChild className="w-fit">
      <Link {...buildForgeProposalNavigation(proposal.id)}>
        Review group
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </Button>
  );
}

function CancelRequestAction({
  disabled,
  state,
}: {
  disabled: boolean;
  state: ReturnType<typeof useAutoForgeRequest>;
}) {
  return (
    <ActionDialog
      cancelLabel="Keep request"
      confirmLabel="Cancel request"
      description="This stops the search for this activity. It does not remove you from a group that has already formed."
      disabled={disabled}
      loading={state.activeAction === "cancel"}
      onConfirm={state.onCancel}
      title="Cancel this Forge request?"
      tone="danger"
      trigger={
        <Button variant="destructive" disabled={disabled}>
          <X className="size-4" aria-hidden="true" />
          Cancel request
        </Button>
      }
    />
  );
}

function getRequestView(request: AutoForgeRequest) {
  if (request.lifecycle === "DRAFT") {
    return {
      label: "Draft needs review",
      description:
        "This saved request will not search until you review and start it.",
    };
  }
  if (request.lifecycle === "SEARCHING") {
    return {
      label: "Searching",
      description: "TeamForge checks automatically; no group has formed yet.",
    };
  }
  if (request.lifecycle === "PAUSED") {
    return {
      label: "Paused",
      description: getPauseDescription(request.pauseReason),
    };
  }
  if (request.lifecycle === "EXPIRED") {
    return {
      label: "Expired",
      description:
        "This request is no longer searching. Start a new request when you are ready.",
    };
  }
  if (request.lifecycle === "RESERVED") {
    return {
      label: "Preparing review",
      description:
        "A possible roster is being checked and prepared for review. No group has formed yet.",
    };
  }
  if (request.lifecycle === "PROPOSED") {
    return {
      label: "Ready to review",
      description: "Check the activity and proposed group before deciding.",
    };
  }
  return {
    label: request.lifecycle === "FORMED" ? "Group formed" : "Closed",
    description:
      request.lifecycle === "FORMED"
        ? "Open its workspace for the next planning action."
        : "This request is no longer active.",
  };
}

function getPauseDescription(reason: AutoForgeRequest["pauseReason"]) {
  if (reason === "CANDIDATE_SEAT") {
    return "This search is paused while another group proposal is resolved. It can resume after release.";
  }
  if (reason === "AUTOMATIC_GROUP_CAPACITY") {
    return "This search is paused while your current TeamForge group limit is in use.";
  }
  if (reason === "AUTOMATIC_RETRY_FAILURE") {
    return "We hit repeated errors while checking this request, so we paused it. Try again when you are ready.";
  }
  if (reason === "PROPOSAL_ENDED") {
    return "That proposal did not form a group, so this request is paused. Keep looking when you are ready.";
  }
  return "You paused this search. Resume it when you are ready.";
}

function EditRequestLink({
  label,
  request,
}: {
  label: string;
  request: AutoForgeRequest;
}) {
  return (
    <Button asChild>
      <Link
        {...buildForgeNavigation({
          open: true,
          step: 3,
          mode: "auto",
          activityId: request.activity.id,
          requestId: request.id,
        })}
        onClick={() => saveAutoForgeRequestAsWizardDraft(request)}
      >
        {label}
      </Link>
    </Button>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
