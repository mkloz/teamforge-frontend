import { Link } from "@tanstack/react-router";
import { Clock3, Pause, RefreshCcw } from "lucide-react";
import { useState } from "react";
import type { ActivityInviteAvailabilityState } from "@/features/settings/hooks/use-activity-invite-availability";
import type { ActivityInviteAvailability } from "@/features/settings/schemas/activity-invite-availability.schema";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { buildSettingsNavigation } from "@/shared/navigation";
import { NotificationPreferenceRow } from "./settings-form-controls";

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
    <section className="grid gap-5 border-border border-t pt-6">
      <ActivityInviteAvailabilityHeader
        availability={availability}
        isRefreshing={state.isRefreshing}
      />

      <p className="text-muted-foreground text-sm leading-relaxed">
        Group organizers may invite you when an open place fits an activity you
        care about. You still review the invitation and decide whether to join.
      </p>

      <fieldset className="grid gap-0 lg:grid-cols-2 lg:gap-8">
        <legend className="mb-2 font-semibold text-ink text-sm lg:col-span-2">
          Invitations you are open to
        </legend>
        <NotificationPreferenceRow
          checked={localEnabled}
          disabled={!canEditScopes || actionDisabled}
          title="Local activities"
          description={getScopeDescription(
            "local",
            availability.localEnabled,
            availability.canAppearInLocalSuggestions,
          )}
          onToggle={() =>
            setDraft({
              sourceKey,
              localEnabled: !localEnabled,
              onlineEnabled,
            })
          }
        />
        <NotificationPreferenceRow
          checked={onlineEnabled}
          disabled={!canEditScopes || actionDisabled}
          title="Online activities"
          description={getScopeDescription(
            "online",
            availability.onlineEnabled,
            availability.canAppearInOnlineSuggestions,
          )}
          onToggle={() =>
            setDraft({
              sourceKey,
              localEnabled,
              onlineEnabled: !onlineEnabled,
            })
          }
        />
      </fieldset>

      {!hasScope ? (
        <p className="text-muted-foreground text-xs">
          Choose at least one activity type to allow invitations.
        </p>
      ) : null}

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
        <div className="flex items-start gap-2 border-border/70 border-y py-3 text-sm">
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

      <Notice tone="neutral" size="md">
        This choice lasts 30 days. TeamForge asks again instead of assuming you
        are still open to invitations.
      </Notice>

      {state.error ? (
        <div className="flex flex-wrap items-center gap-3" role="alert">
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
        <p className="mt-1 text-muted-foreground text-xs">
          Choose whether organizers may find you for an open place.
        </p>
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
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-muted-foreground text-sm">
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
      <ActionDialog
        cancelLabel="Not now"
        confirmLabel={shouldSaveScopes ? "Save and reopen" : "Confirm I'm open"}
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
          <Button disabled={!canConfirm} className="w-fit">
            <RefreshCcw className="size-4" aria-hidden="true" />
            {shouldSaveScopes ? "Save and reopen" : "Confirm I'm still open"}
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
        confirmLabel={isOpen ? "Save choices" : "Allow invitations"}
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
        title={isOpen ? "Update invitation types?" : "Allow invitations?"}
        trigger={
          <Button disabled={actionDisabled || !canSave}>
            {isOpen ? "Save invitation types" : "Allow invitations"}
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
            <Button variant="outline" disabled={actionDisabled}>
              <Pause className="size-4" aria-hidden="true" />
              Pause invitations
            </Button>
          }
        />
      ) : null}
    </div>
  );
}

function ActivityInviteAvailabilityLoading() {
  return (
    <section className="grid gap-3 border-border border-t pt-6" role="status">
      <div className="h-5 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
      <div className="h-20 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
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
    <section className="grid gap-3 border-border border-t pt-6" role="alert">
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

function getScopeDescription(
  scope: "local" | "online",
  saved: boolean,
  canAppear: boolean,
) {
  if (saved && !canAppear) {
    return `Saved, but ${scope} suggestions are unavailable right now.`;
  }

  return scope === "local"
    ? "Invitations for activities near your saved area."
    : "Invitations for activities that happen online.";
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
