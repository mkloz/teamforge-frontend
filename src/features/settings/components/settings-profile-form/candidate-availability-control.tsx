import { Link } from "@tanstack/react-router";
import { Clock3, Pause, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import type { CandidateAvailabilityState } from "@/features/settings/hooks/use-candidate-availability";
import type { CandidateAvailability } from "@/features/settings/schemas/candidate-availability.schema";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { buildSettingsNavigation } from "@/shared/navigation";
import { NotificationPreferenceRow } from "./settings-form-controls";

interface CandidateAvailabilityControlProps {
  hasSavedLocation: boolean;
  state: CandidateAvailabilityState;
}

export function CandidateAvailabilityControl({
  hasSavedLocation,
  state,
}: CandidateAvailabilityControlProps) {
  const { availability } = state;
  const [localEnabled, setLocalEnabled] = useState(false);
  const [onlineEnabled, setOnlineEnabled] = useState(false);

  useEffect(() => {
    setLocalEnabled(availability?.localEnabled ?? false);
    setOnlineEnabled(availability?.onlineEnabled ?? false);
  }, [availability?.localEnabled, availability?.onlineEnabled]);

  if (state.isLoading) {
    return (
      <section className="grid gap-3 border-border border-t pt-6" role="status">
        <div className="h-5 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="h-20 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
        <span className="sr-only">Loading proposal availability</span>
      </section>
    );
  }

  if (state.isLoadError || !availability) {
    return (
      <section className="grid gap-3 border-border border-t pt-6" role="alert">
        <p className="text-muted-foreground text-sm">
          We could not load your proposal availability.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={state.onRetry}
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </section>
    );
  }

  const isBusy = state.activeAction !== null;
  const canEditScopes =
    availability.lifecycle === null || availability.lifecycle === "OPEN";
  const hasScope = localEnabled || onlineEnabled;
  const scopesChanged =
    localEnabled !== availability.localEnabled ||
    onlineEnabled !== availability.onlineEnabled;
  const actionDisabled = !state.isOnline || state.isStateError || isBusy;

  return (
    <section className="grid gap-5 border-border border-t pt-6">
      <AvailabilityHeader
        lifecycle={availability.lifecycle}
        isRefreshing={state.isRefreshing}
      />

      <p className="text-muted-foreground text-sm leading-relaxed">
        TeamForge may show you an activity-led group proposal. This is not a
        calendar, and you will never join automatically. You decide after
        reviewing the proposal.
      </p>

      {availability.legacyAvailabilityPrompt && !availability.lifecycle ? (
        <p className="rounded-2xl border border-border bg-muted/40 p-4 text-ink text-sm leading-relaxed">
          You previously allowed automatic group forming. Review the new choices
          below; nothing has been enabled for you.
        </p>
      ) : null}

      <fieldset className="grid gap-0 lg:grid-cols-2 lg:gap-8">
        <legend className="mb-2 font-semibold text-ink text-sm lg:col-span-2">
          Where activities happen
        </legend>
        <NotificationPreferenceRow
          checked={localEnabled}
          disabled={!canEditScopes || actionDisabled}
          title="Local activities"
          description="Proposals for activities near your saved area."
          onToggle={() => setLocalEnabled((current) => !current)}
        />
        <NotificationPreferenceRow
          checked={onlineEnabled}
          disabled={!canEditScopes || actionDisabled}
          title="Online activities"
          description="Proposals for activities that happen online."
          onToggle={() => setOnlineEnabled((current) => !current)}
        />
      </fieldset>

      {!hasScope ? (
        <p className="text-muted-foreground text-xs">
          Choose at least one activity type to allow proposals.
        </p>
      ) : null}

      {localEnabled && !hasSavedLocation ? (
        <p className="text-muted-foreground text-sm">
          Local proposals need a saved location.{" "}
          <Link
            {...buildSettingsNavigation("account")}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Add your location
          </Link>
        </p>
      ) : null}

      <AvailabilityFacts availability={availability} />

      {state.error ? (
        <div className="flex flex-wrap items-center gap-3" role="alert">
          <p className="text-destructive text-sm">{state.error}</p>
          {state.isStateError ? (
            <Button variant="outline" size="sm" onClick={state.onRetry}>
              <RefreshCcw className="size-4" aria-hidden="true" />
              Refresh status
            </Button>
          ) : null}
        </div>
      ) : null}

      <AvailabilityActions
        actionDisabled={actionDisabled}
        activeAction={state.activeAction}
        availability={availability}
        hasSavedLocation={hasSavedLocation}
        hasScope={hasScope}
        localEnabled={localEnabled}
        onlineEnabled={onlineEnabled}
        scopesChanged={scopesChanged}
        onPause={state.onPause}
        onReconfirm={state.onReconfirm}
        onUpdate={state.onUpdate}
      />
    </section>
  );
}

function AvailabilityHeader({
  lifecycle,
  isRefreshing,
}: {
  lifecycle: "OPEN" | "PAUSED" | "EXPIRED" | "RESTRICTED" | null;
  isRefreshing: boolean;
}) {
  const labels = {
    OPEN: "Open to proposals",
    PAUSED: "Paused",
    EXPIRED: "Confirmation needed",
    RESTRICTED: "Unavailable",
  } as const;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="font-semibold text-base text-ink">Group proposals</h3>
        <p className="mt-1 text-muted-foreground text-xs">
          Choose whether TeamForge may show you local or online proposals.
        </p>
      </div>
      <StatusPill
        size="sm"
        tone={lifecycle === "OPEN" ? "teal" : "muted"}
        surface="soft"
      >
        {lifecycle ? labels[lifecycle] : "Not enabled"}
      </StatusPill>
      {isRefreshing ? (
        <span className="sr-only" role="status">
          Refreshing proposal availability
        </span>
      ) : null}
    </div>
  );
}

function AvailabilityFacts({
  availability,
}: {
  availability: CandidateAvailability;
}) {
  const hasActiveCooldown =
    availability.proposalCooldownUntil !== null &&
    new Date(availability.proposalCooldownUntil).getTime() > Date.now();

  if (!availability.availableUntil && !hasActiveCooldown) {
    return null;
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-2">
      {availability.availableUntil ? (
        <AvailabilityFact
          icon={Clock3}
          label="Open until"
          value={formatDate(availability.availableUntil)}
        />
      ) : null}
      {hasActiveCooldown && availability.proposalCooldownUntil ? (
        <AvailabilityFact
          icon={Clock3}
          label="New proposals paused until"
          value={formatDate(availability.proposalCooldownUntil)}
        />
      ) : null}
    </div>
  );
}

function AvailabilityFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 text-forge-teal" aria-hidden="true" />
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

function AvailabilityActions({
  actionDisabled,
  activeAction,
  availability,
  hasSavedLocation,
  hasScope,
  localEnabled,
  onlineEnabled,
  scopesChanged,
  onPause,
  onReconfirm,
  onUpdate,
}: {
  actionDisabled: boolean;
  activeAction: CandidateAvailabilityState["activeAction"];
  availability: CandidateAvailability;
  hasSavedLocation: boolean;
  hasScope: boolean;
  localEnabled: boolean;
  onlineEnabled: boolean;
  scopesChanged: boolean;
  onPause: (policyVersion: string, expectedRevision: number) => Promise<void>;
  onReconfirm: (
    policyVersion: string,
    expectedRevision: number,
  ) => Promise<void>;
  onUpdate: (payload: {
    expectedRevision: number | null;
    localEnabled: boolean;
    onlineEnabled: boolean;
    policyVersion: string;
  }) => Promise<void>;
}) {
  if (availability.lifecycle === "RESTRICTED") {
    return (
      <p className="text-muted-foreground text-sm">
        Proposal availability cannot be enabled for this account right now.
      </p>
    );
  }

  if (
    availability.lifecycle === "PAUSED" ||
    availability.lifecycle === "EXPIRED"
  ) {
    const reconfirmDisabled =
      actionDisabled || (availability.localEnabled && !hasSavedLocation);

    return (
      <ActionDialog
        cancelLabel="Not now"
        confirmLabel="Confirm I'm open"
        description="This keeps your local and online choices open for another 30 days. You still review every proposal before joining."
        disabled={reconfirmDisabled}
        loading={activeAction === "reconfirm"}
        onConfirm={() =>
          onReconfirm(availability.policyVersion, availability.revision)
        }
        title="Open to group proposals again?"
        trigger={
          <Button disabled={reconfirmDisabled} className="w-fit">
            <RefreshCcw className="size-4" aria-hidden="true" />
            Confirm I'm still open
          </Button>
        }
      />
    );
  }

  const isOpen = availability.lifecycle === "OPEN";
  const canSave =
    hasScope &&
    (!localEnabled || hasSavedLocation) &&
    (!isOpen || scopesChanged);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <ActionDialog
        cancelLabel="Go back"
        confirmLabel={isOpen ? "Save choices" : "Allow proposals"}
        description="TeamForge may show you activity-led group proposals for the next 30 days. You review each one before deciding whether to join."
        disabled={actionDisabled || !canSave}
        loading={activeAction === "update"}
        onConfirm={() =>
          onUpdate({
            expectedRevision: isOpen ? availability.revision : null,
            localEnabled,
            onlineEnabled,
            policyVersion: availability.policyVersion,
          })
        }
        title={isOpen ? "Update proposal types?" : "Allow group proposals?"}
        trigger={
          <Button disabled={actionDisabled || !canSave}>
            {isOpen ? "Save proposal types" : "Allow group proposals"}
          </Button>
        }
      />

      {isOpen ? (
        <ActionDialog
          cancelLabel="Stay open"
          confirmLabel="Pause proposals"
          description="Pausing stops TeamForge from showing you new proposals."
          disabled={actionDisabled}
          loading={activeAction === "pause"}
          onConfirm={() =>
            onPause(availability.policyVersion, availability.revision)
          }
          title="Pause new proposals?"
          trigger={
            <Button variant="outline" disabled={actionDisabled}>
              <Pause className="size-4" aria-hidden="true" />
              Pause new proposals
            </Button>
          }
        />
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
