import { Link } from "@tanstack/react-router";
import { Clock3, MapPin, Pause, RefreshCcw, Wifi } from "lucide-react";
import { useState } from "react";
import { AvailabilityScopeOption } from "@/features/settings/components/settings-profile-form/availability-scope-option";
import type { ActivityInviteAvailabilityState } from "@/features/settings/hooks/use-activity-invite-availability";
import type { ActivityInviteAvailability } from "@/features/settings/schemas/activity-invite-availability.schema";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { buildSettingsNavigation } from "@/shared/navigation";

interface ActivityInviteAvailabilityControlProps {
  hasSavedLocation: boolean;
  state: ActivityInviteAvailabilityState;
}

export function ActivityInviteAvailabilityControl({
  hasSavedLocation,
  state,
}: ActivityInviteAvailabilityControlProps) {
  const { availability } = state;

  if (state.isLoading) {
    return <ActivityInviteAvailabilityLoading />;
  }

  if (state.isLoadError || !availability) {
    return <ActivityInviteAvailabilityLoadError onRetry={state.onRetry} />;
  }

  return (
    <ActivityInviteAvailabilityEditor
      availability={availability}
      hasSavedLocation={hasSavedLocation}
      state={state}
    />
  );
}

function ActivityInviteAvailabilityEditor({
  availability,
  hasSavedLocation,
  state,
}: {
  availability: ActivityInviteAvailability;
  hasSavedLocation: boolean;
  state: ActivityInviteAvailabilityState;
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
  const isOpen = availability.lifecycle === "OPEN";
  const canEditScopes = availability.lifecycle !== "RESTRICTED";
  const hasScope = localEnabled || onlineEnabled;
  const scopesChanged =
    localEnabled !== availability.localEnabled ||
    onlineEnabled !== availability.onlineEnabled;
  const actionDisabled = !state.isOnline || state.isStateError || isBusy;

  return (
    <section className="grid gap-3 rounded-2xl bg-card px-3 py-4 sm:gap-4 sm:px-5">
      <ActivityInviteAvailabilityHeader
        availability={availability}
        isRefreshing={state.isRefreshing}
      />

      <p className="text-muted-foreground text-sm leading-relaxed">
        Organizers may invite you to a relevant opening; you decide whether to
        join.
      </p>

      <fieldset className="min-w-0">
        <legend className="mb-2 font-bold text-ink text-sm">
          Choose where invitations can happen
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
          Local invitations need a saved location. Turn off local invitations or{" "}
          <Link
            {...buildSettingsNavigation("account")}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            add your location
          </Link>
          .
        </p>
      ) : null}

      {availability.availableUntil && isOpen ? (
        <div className="flex items-start gap-2 rounded-xl bg-background/55 px-4 py-3 text-sm">
          <Clock3
            className="mt-0.5 size-4 text-forge-teal"
            aria-hidden="true"
          />
          <div>
            <p className="text-muted-foreground text-xs">Confirm again by</p>
            <p className="font-medium text-ink">
              {formatDate(availability.availableUntil)}
            </p>
          </div>
        </div>
      ) : null}

      {state.error ? (
        <div className="flex flex-wrap items-center gap-2 px-0.5" role="alert">
          <p className="text-destructive text-sm">{state.error}</p>
          {state.isStateError ? (
            <Button variant="outline" size="sm" onClick={state.onRetry}>
              <RefreshCcw className="size-4" aria-hidden="true" />
              Refresh setting
            </Button>
          ) : null}
        </div>
      ) : null}

      <ActivityInviteAvailabilityActions
        actionDisabled={actionDisabled}
        availability={availability}
        hasSavedLocation={hasSavedLocation}
        hasScope={hasScope}
        localEnabled={localEnabled}
        onlineEnabled={onlineEnabled}
        scopesChanged={scopesChanged}
        state={state}
      />
    </section>
  );
}

function ActivityInviteAvailabilityHeader({
  availability,
  isRefreshing,
}: {
  availability: ActivityInviteAvailability;
  isRefreshing: boolean;
}) {
  const labels = {
    OPEN: canAppearInSuggestions(availability)
      ? "Open to invitations"
      : "Not currently suggested",
    PAUSED: "Paused",
    EXPIRED: "Confirmation needed",
    RESTRICTED: "Unavailable",
  } as const;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="font-semibold text-base text-ink">
          Activity invitations
        </h3>
      </div>
      <StatusPill
        size="sm"
        tone={
          availability.lifecycle === "OPEN" &&
          canAppearInSuggestions(availability)
            ? "teal"
            : "muted"
        }
        surface="soft"
      >
        {availability.lifecycle
          ? labels[availability.lifecycle]
          : "Not enabled"}
      </StatusPill>
      {isRefreshing ? (
        <span className="sr-only" role="status">
          Refreshing activity invitation setting
        </span>
      ) : null}
    </div>
  );
}

function ActivityInviteAvailabilityActions({
  actionDisabled,
  availability,
  hasSavedLocation,
  hasScope,
  localEnabled,
  onlineEnabled,
  scopesChanged,
  state,
}: {
  actionDisabled: boolean;
  availability: ActivityInviteAvailability;
  hasSavedLocation: boolean;
  hasScope: boolean;
  localEnabled: boolean;
  onlineEnabled: boolean;
  scopesChanged: boolean;
  state: ActivityInviteAvailabilityState;
}) {
  if (availability.lifecycle === "RESTRICTED") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-muted-foreground text-sm">
          Activity invitations are unavailable right now. Check again later.
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={actionDisabled || state.isRefreshing}
          onClick={state.onRetry}
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
    const shouldSaveScopes = scopesChanged;
    const canConfirm =
      hasScope && (!localEnabled || hasSavedLocation) && !actionDisabled;

    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-muted-foreground text-sm">
          Reopen your saved invitation choices for another 30 days.
        </p>
        <ActionDialog
          cancelLabel="Not now"
          confirmLabel={
            shouldSaveScopes ? "Save and reopen" : "Confirm I'm open"
          }
          description={
            shouldSaveScopes
              ? "This saves your new invitation types and opens them for 30 days. You still decide on every invitation."
              : "This renews your saved local and online choices for another 30 days. You still decide on every invitation."
          }
          disabled={!canConfirm}
          loading={
            state.activeAction === (shouldSaveScopes ? "update" : "reconfirm")
          }
          onConfirm={() =>
            shouldSaveScopes
              ? state.onUpdate({
                  expectedRevision: availability.revision,
                  localEnabled,
                  onlineEnabled,
                })
              : state.onReconfirm(availability.revision)
          }
          title="Open to activity invitations again?"
          trigger={
            <Button size="compact" disabled={!canConfirm} className="shrink-0">
              <RefreshCcw className="size-4" aria-hidden="true" />
              {shouldSaveScopes ? "Save and reopen" : "Reopen invitations"}
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
  const actionMessage = getInvitationActionMessage({
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
          confirmLabel={isOpen ? "Save choices" : "Turn on invitations"}
          description="Organizers may invite you to a relevant group with space. You review the invitation before anything changes."
          disabled={actionDisabled || !canSave}
          loading={state.activeAction === "update"}
          onConfirm={() =>
            state.onUpdate({
              expectedRevision: isOpen ? availability.revision : null,
              localEnabled,
              onlineEnabled,
            })
          }
          title={isOpen ? "Update invitation types?" : "Turn on invitations?"}
          trigger={
            <Button size="compact" disabled={actionDisabled || !canSave}>
              {isOpen ? "Save changes" : "Turn on invitations"}
            </Button>
          }
        />

        {isOpen ? (
          <ActionDialog
            cancelLabel="Stay open"
            confirmLabel="Pause invitations"
            description="Pausing removes you from new activity invitation suggestions."
            disabled={actionDisabled}
            loading={state.activeAction === "pause"}
            onConfirm={() => state.onPause(availability.revision)}
            title="Pause activity invitations?"
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

function getInvitationActionMessage({
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
    return "Add a saved location before turning on local invitations.";
  }

  if (isOpen) {
    return scopesChanged
      ? "Your new invitation choices are ready to save."
      : "Your invitation choices are up to date.";
  }

  return "Stay open for 30 days. You still decide on every invitation.";
}

function ActivityInviteAvailabilityLoading() {
  return (
    <section
      className="grid gap-3 rounded-2xl bg-card p-3 sm:p-5"
      role="status"
    >
      <div className="h-5 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
      <div className="h-24 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      <span className="sr-only">Loading activity invitation setting</span>
    </section>
  );
}

function ActivityInviteAvailabilityLoadError({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <section className="grid gap-3 rounded-2xl bg-card p-3 sm:p-5" role="alert">
      <p className="text-muted-foreground text-sm">
        We could not load your activity invitation setting.
      </p>
      <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
        <RefreshCcw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}

function canAppearInSuggestions(availability: ActivityInviteAvailability) {
  return (
    availability.canAppearInLocalSuggestions ||
    availability.canAppearInOnlineSuggestions
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
