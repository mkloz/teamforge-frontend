import { Link } from "@tanstack/react-router";
import { Clock3, MapPin, Pause, RefreshCcw, Wifi } from "lucide-react";
import { useState } from "react";
import type {
  CandidateAvailability,
  CandidateAvailabilityState,
} from "@/features/forge/public/candidate-availability";
import { AvailabilityScopeOption } from "@/features/settings/components/settings-profile-form/availability-scope-option";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Notice } from "@/shared/components/ui/notice";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import { buildSettingsNavigation } from "@/shared/navigation";

interface CandidateAvailabilityControlProps {
  hasSavedLocation: boolean;
  state: CandidateAvailabilityState;
}

export function CandidateAvailabilityControl({
  hasSavedLocation,
  state,
}: CandidateAvailabilityControlProps) {
  const { availability } = state;

  if (state.isLoading) {
    return (
      <section
        className="grid gap-3 rounded-2xl bg-card p-3 sm:p-5"
        role="status"
      >
        <div className="h-5 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="h-24 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        <span className="sr-only">Loading proposal availability</span>
      </section>
    );
  }

  if (state.isLoadError || !availability) {
    return (
      <section
        className="grid gap-3 rounded-2xl bg-card p-3 sm:p-5"
        role="alert"
      >
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

  return (
    <CandidateAvailabilityEditor
      availability={availability}
      hasSavedLocation={hasSavedLocation}
      state={state}
    />
  );
}

function CandidateAvailabilityEditor({
  availability,
  hasSavedLocation,
  state,
}: {
  availability: CandidateAvailability;
  hasSavedLocation: boolean;
  state: CandidateAvailabilityState;
}) {
  const sourceKey = `${availability.policyVersion}:${availability.revision}`;
  const [draft, setDraft] = useState({
    sourceKey,
    localEnabled: availability.localEnabled,
    onlineEnabled: availability.onlineEnabled,
  });
  const localEnabled =
    draft.sourceKey === sourceKey
      ? draft.localEnabled
      : availability.localEnabled;
  const onlineEnabled =
    draft.sourceKey === sourceKey
      ? draft.onlineEnabled
      : availability.onlineEnabled;

  const isBusy = state.activeAction !== null;
  const canEditScopes =
    availability.lifecycle === null || availability.lifecycle === "OPEN";
  const hasScope = localEnabled || onlineEnabled;
  const scopesChanged =
    localEnabled !== availability.localEnabled ||
    onlineEnabled !== availability.onlineEnabled;
  const actionDisabled = !state.isOnline || state.isStateError || isBusy;

  return (
    <section className="grid gap-3 rounded-2xl bg-card px-3 py-4 sm:gap-4 sm:px-5">
      <AvailabilityHeader
        availability={availability}
        isRefreshing={state.isRefreshing}
      />

      <p className="text-muted-foreground text-sm leading-relaxed">
        You review every proposal before deciding whether to join.
      </p>

      {availability.legacyAvailabilityPrompt ? (
        <Notice tone="neutral" size="md">
          TeamForge now handles group-proposal availability separately from your
          old automatic-group setting. Review the choices below.
        </Notice>
      ) : null}

      {availability.lifecycle === "OPEN" &&
      !canReceiveAnyProposal(availability) ? (
        <Notice tone="neutral" size="md">
          Your choices are saved, but you cannot receive a new proposal right
          now. Check again later for an updated status.
        </Notice>
      ) : null}

      <fieldset className="min-w-0">
        <legend className="mb-2 font-bold text-ink text-sm">
          Choose where proposals can happen
        </legend>
        <GroupedMenuList>
          <GroupedMenuItem className="bg-background/55">
            <AvailabilityScopeOption
              checked={localEnabled}
              disabled={!canEditScopes || actionDisabled}
              icon={MapPin}
              title="Local activities"
              onToggle={() =>
                setDraft({
                  sourceKey,
                  localEnabled: !localEnabled,
                  onlineEnabled,
                })
              }
            />
          </GroupedMenuItem>
          <GroupedMenuItem className="bg-background/55">
            <AvailabilityScopeOption
              checked={onlineEnabled}
              disabled={!canEditScopes || actionDisabled}
              icon={Wifi}
              title="Online activities"
              onToggle={() =>
                setDraft({
                  sourceKey,
                  localEnabled,
                  onlineEnabled: !onlineEnabled,
                })
              }
            />
          </GroupedMenuItem>
        </GroupedMenuList>
      </fieldset>

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
        <div className="flex flex-wrap items-center gap-2 px-0.5" role="alert">
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
        isRefreshing={state.isRefreshing}
        scopesChanged={scopesChanged}
        onPause={state.onPause}
        onReconfirm={state.onReconfirm}
        onRetry={state.onRetry}
        onUpdate={state.onUpdate}
      />
    </section>
  );
}

function AvailabilityHeader({
  availability,
  isRefreshing,
}: {
  availability: CandidateAvailability;
  isRefreshing: boolean;
}) {
  const { lifecycle } = availability;
  const labels = {
    OPEN: canReceiveAnyProposal(availability)
      ? "Open to proposals"
      : "Not receiving proposals",
    PAUSED: "Paused",
    EXPIRED: "Confirmation needed",
    RESTRICTED: "Unavailable",
  } as const;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="font-semibold text-base text-ink">Group proposals</h3>
      </div>
      <StatusPill
        size="sm"
        tone={
          lifecycle === "OPEN" && canReceiveAnyProposal(availability)
            ? "teal"
            : "muted"
        }
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
  const showAvailableUntil =
    availability.lifecycle === "OPEN" && availability.availableUntil !== null;

  if (!showAvailableUntil && !hasActiveCooldown) {
    return null;
  }

  return (
    <dl className="grid gap-4 rounded-xl bg-background/55 px-4 py-3 text-sm sm:grid-cols-2">
      {showAvailableUntil && availability.availableUntil ? (
        <AvailabilityFact
          icon={Clock3}
          label="Open until"
          value={formatDate(availability.availableUntil)}
        />
      ) : null}
      {hasActiveCooldown && availability.proposalCooldownUntil ? (
        <AvailabilityFact
          separated={showAvailableUntil}
          icon={Clock3}
          label="Proposal cooldown ends"
          value={formatDate(availability.proposalCooldownUntil)}
        />
      ) : null}
    </dl>
  );
}

function AvailabilityFact({
  icon: Icon,
  label,
  separated = false,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  separated?: boolean;
  value: string;
}) {
  return (
    <div className={cn("flex items-start gap-2", separated && "sm:pl-2")}>
      <Icon className="mt-0.5 size-4 text-forge-teal" aria-hidden="true" />
      <div>
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="font-medium text-ink">{value}</dd>
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
  isRefreshing,
  scopesChanged,
  onPause,
  onReconfirm,
  onRetry,
  onUpdate,
}: {
  actionDisabled: boolean;
  activeAction: CandidateAvailabilityState["activeAction"];
  availability: CandidateAvailability;
  hasSavedLocation: boolean;
  hasScope: boolean;
  localEnabled: boolean;
  onlineEnabled: boolean;
  isRefreshing: boolean;
  scopesChanged: boolean;
  onPause: (policyVersion: string, expectedRevision: number) => Promise<void>;
  onReconfirm: (
    policyVersion: string,
    expectedRevision: number,
  ) => Promise<void>;
  onRetry: () => void;
  onUpdate: (payload: {
    expectedRevision: number | null;
    localEnabled: boolean;
    onlineEnabled: boolean;
    policyVersion: string;
  }) => Promise<void>;
}) {
  if (availability.lifecycle === "RESTRICTED") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-muted-foreground text-sm">
          New group proposals are unavailable right now. This status can change,
          so check again later.
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={actionDisabled || isRefreshing}
          onClick={onRetry}
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Check again
        </Button>
      </div>
    );
  }

  if (
    availability.lifecycle === "PAUSED" ||
    availability.lifecycle === "EXPIRED"
  ) {
    const reconfirmDisabled =
      actionDisabled || (availability.localEnabled && !hasSavedLocation);

    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-muted-foreground text-sm">
          Reopen your saved proposal choices for another 30 days.
        </p>
        <ActionDialog
          cancelLabel="Not now"
          confirmLabel="Confirm I'm open"
          description="This reopens your saved proposal types for 30 days. You still review every proposal before deciding whether to join."
          disabled={reconfirmDisabled}
          loading={activeAction === "reconfirm"}
          onConfirm={() =>
            onReconfirm(availability.policyVersion, availability.revision)
          }
          title="Open to group proposals again?"
          trigger={
            <Button
              size="compact"
              disabled={reconfirmDisabled}
              className="shrink-0"
            >
              <RefreshCcw className="size-4" aria-hidden="true" />
              Reopen proposals
            </Button>
          }
        />
      </div>
    );
  }

  const isOpen = availability.lifecycle === "OPEN";
  const canSave =
    hasScope &&
    (!localEnabled || hasSavedLocation) &&
    (!isOpen || scopesChanged);
  const actionMessage = getProposalActionMessage({
    hasSavedLocation,
    hasScope,
    isOpen,
    localEnabled,
    scopesChanged,
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-sm text-muted-foreground text-sm leading-relaxed">
        {actionMessage}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <ActionDialog
          cancelLabel="Go back"
          confirmLabel={isOpen ? "Save choices" : "Turn on proposals"}
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
          title={isOpen ? "Update proposal types?" : "Turn on proposals?"}
          trigger={
            <Button size="compact" disabled={actionDisabled || !canSave}>
              {isOpen ? "Save changes" : "Turn on proposals"}
            </Button>
          }
        />

        {isOpen ? (
          <ActionDialog
            cancelLabel="Stay open"
            confirmLabel="Pause proposals"
            description="Pausing stops TeamForge from showing you new proposals. It does not remove you from a proposal you are already reviewing."
            disabled={actionDisabled}
            loading={activeAction === "pause"}
            onConfirm={() =>
              onPause(availability.policyVersion, availability.revision)
            }
            title="Pause new proposals?"
            trigger={
              <Button
                variant="outline"
                size="compact"
                disabled={actionDisabled}
              >
                <Pause className="size-4" aria-hidden="true" />
                Pause
              </Button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}

function getProposalActionMessage({
  hasSavedLocation,
  hasScope,
  isOpen,
  localEnabled,
  scopesChanged,
}: {
  hasSavedLocation: boolean;
  hasScope: boolean;
  isOpen: boolean;
  localEnabled: boolean;
  scopesChanged: boolean;
}) {
  if (!hasScope) {
    return "Select at least one activity type to continue.";
  }

  if (localEnabled && !hasSavedLocation) {
    return "Add a saved location before turning on local proposals.";
  }

  if (isOpen) {
    return scopesChanged
      ? "Your new proposal choices are ready to save."
      : "Your proposal choices are up to date.";
  }

  return "Stay discoverable for 30 days. You still review every proposal first.";
}

function canReceiveAnyProposal(availability: CandidateAvailability) {
  return (
    availability.canReceiveLocalProposals ||
    availability.canReceiveOnlineProposals
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
