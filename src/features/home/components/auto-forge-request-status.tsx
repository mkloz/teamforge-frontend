import { Link } from "@tanstack/react-router";
import { Pause, RefreshCcw, Search, X } from "lucide-react";
import {
  type AutoForgeRequest,
  clearAutoForgeRequestWizardDraft,
  saveAutoForgeRequestAsWizardDraft,
  useAutoForgeRequest,
} from "@/features/forge/public/auto-forge-request";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import {
  buildForgeLaunchNavigation,
  buildForgeNavigation,
} from "@/shared/navigation";

export function AutoForgeRequestStatus() {
  const state = useAutoForgeRequest();

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
    );
  }

  if (!state.request) return null;

  return <RequestStatusCard request={state.request} state={state} />;
}

function RequestStatusCard({
  request,
  state,
}: {
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
        eyebrow="Forge request"
        title={request.activity.title}
        description={view.description}
      />

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusPill
            size="sm"
            tone={request.lifecycle === "SEARCHING" ? "teal" : "muted"}
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
    <dl className="grid gap-3 rounded-2xl bg-muted/45 p-4 text-sm sm:grid-cols-2">
      <div className="grid gap-1">
        <dt className="text-muted-foreground text-xs">Last check</dt>
        <dd className="font-medium text-foreground">
          {request.lastAttemptAt
            ? formatDate(request.lastAttemptAt)
            : "Not checked yet"}
        </dd>
      </div>
      <div className="grid gap-1">
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
  request,
  state,
}: {
  actionDisabled: boolean;
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

  return null;
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
      description:
        "Your request is active. TeamForge will check it again automatically; no group has formed yet.",
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
  if (request.lifecycle === "RESERVED" || request.lifecycle === "PROPOSED") {
    return {
      label: "Request in progress",
      description:
        "This request has moved to a later stage. More details are not available on this screen yet.",
    };
  }
  return {
    label: request.lifecycle === "FORMED" ? "Group formed" : "Closed",
    description:
      request.lifecycle === "FORMED"
        ? "Your group has formed. Its group workspace will show the next planning action."
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
