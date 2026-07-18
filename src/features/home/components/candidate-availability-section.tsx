import { Link } from "@tanstack/react-router";
import { Clock3, MapPin, Monitor, Pause, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

import {
  type CandidateAvailability,
  type CandidateAvailabilityState,
  useCandidateAvailability,
} from "@/features/forge/public/candidate-availability";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { Switch } from "@/shared/components/ui/switch";
import { buildSettingsNavigation } from "@/shared/navigation";

const SECTION_HEADING_ID = "candidate-availability-heading";

export function CandidateAvailabilitySection() {
  const state = useCandidateAvailability({ enabled: true });
  const currentUserQuery = useCurrentUserQuery();

  if (state.isLoading) {
    return <CandidateAvailabilityLoading />;
  }

  if (state.isLoadError || !state.availability) {
    return <CandidateAvailabilityError onRetry={state.onRetry} />;
  }

  const hasSavedLocation =
    currentUserQuery.data?.locationLat != null &&
    currentUserQuery.data.locationLng != null;

  return (
    <CandidateAvailabilityContent
      availability={state.availability}
      hasSavedLocation={hasSavedLocation}
      isCheckingLocation={currentUserQuery.isLoading}
      state={state}
    />
  );
}

function CandidateAvailabilityLoading() {
  return (
    <section
      className="grid gap-4"
      aria-label="Loading group proposal availability"
      role="status"
    >
      <Skeleton className="h-5 w-32" />
      <div className="grid gap-3 border-border/70 border-y py-5">
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-10 w-44" />
      </div>
      <span className="sr-only">Loading group proposal availability</span>
    </section>
  );
}

function CandidateAvailabilityError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="grid gap-3" aria-label="Group proposals" role="alert">
      <HomeSectionHeading
        eyebrow="Group proposals"
        title="Choose whether you’re open"
      />
      <p className="text-muted-foreground text-sm">
        We couldn’t load your group proposal status.
      </p>
      <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
        <RefreshCcw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}

function CandidateAvailabilityContent({
  availability,
  hasSavedLocation,
  isCheckingLocation,
  state,
}: {
  availability: CandidateAvailability;
  hasSavedLocation: boolean;
  isCheckingLocation: boolean;
  state: CandidateAvailabilityState;
}) {
  const [localEnabled, setLocalEnabled] = useState(availability.localEnabled);
  const [onlineEnabled, setOnlineEnabled] = useState(
    availability.onlineEnabled,
  );
  const view = getAvailabilityView(availability);

  useEffect(() => {
    setLocalEnabled(availability.localEnabled);
    setOnlineEnabled(availability.onlineEnabled);
  }, [availability.localEnabled, availability.onlineEnabled]);

  return (
    <section className="grid gap-4" aria-labelledby={SECTION_HEADING_ID}>
      <HomeSectionHeading
        id={SECTION_HEADING_ID}
        eyebrow="Group proposals"
        title={view.title}
        description={view.description}
        action={
          <StatusPill size="sm" surface="soft" tone={view.tone}>
            {view.label}
          </StatusPill>
        }
      />

      <div className="grid gap-5 border-border/70 border-y py-5">
        {availability.lifecycle === null ? (
          <AvailabilityChoices
            actionDisabled={isAvailabilityActionDisabled(state)}
            hasSavedLocation={hasSavedLocation}
            isCheckingLocation={isCheckingLocation}
            localEnabled={localEnabled}
            onlineEnabled={onlineEnabled}
            onLocalChange={setLocalEnabled}
            onOnlineChange={setOnlineEnabled}
          />
        ) : (
          <SelectedScopes availability={availability} />
        )}

        <AvailabilityLimits availability={availability} />
        <AvailabilityExpiry availability={availability} />

        {state.isRefreshing ? (
          <span className="sr-only" role="status">
            Refreshing group proposal status
          </span>
        ) : null}

        {state.error ? (
          <div className="flex flex-wrap items-center gap-3" role="alert">
            <p className="text-destructive text-sm">{state.error}</p>
            {state.isStateError ? (
              <Button variant="outline" size="sm" onClick={state.onRetry}>
                Refresh status
              </Button>
            ) : null}
          </div>
        ) : null}

        {!state.isOnline ? (
          <p className="text-muted-foreground text-sm">
            Reconnect before changing this setting.
          </p>
        ) : null}

        <AvailabilityActions
          availability={availability}
          hasSavedLocation={hasSavedLocation}
          isCheckingLocation={isCheckingLocation}
          localEnabled={localEnabled}
          onlineEnabled={onlineEnabled}
          state={state}
        />
      </div>
    </section>
  );
}

function AvailabilityChoices({
  actionDisabled,
  hasSavedLocation,
  isCheckingLocation,
  localEnabled,
  onlineEnabled,
  onLocalChange,
  onOnlineChange,
}: {
  actionDisabled: boolean;
  hasSavedLocation: boolean;
  isCheckingLocation: boolean;
  localEnabled: boolean;
  onlineEnabled: boolean;
  onLocalChange: (enabled: boolean) => void;
  onOnlineChange: (enabled: boolean) => void;
}) {
  return (
    <fieldset className="grid gap-0 sm:grid-cols-2 sm:gap-8">
      <legend className="mb-2 font-semibold text-ink text-sm sm:col-span-2">
        Where the activity can happen
      </legend>
      <AvailabilityChoice
        checked={localEnabled}
        description="Near your saved area"
        disabled={actionDisabled}
        icon={MapPin}
        label="Local"
        onCheckedChange={onLocalChange}
      />
      <AvailabilityChoice
        checked={onlineEnabled}
        description="In an online group space"
        disabled={actionDisabled}
        icon={Monitor}
        label="Online"
        onCheckedChange={onOnlineChange}
      />

      {localEnabled && !hasSavedLocation ? (
        <p className="mt-3 text-muted-foreground text-sm sm:col-span-2">
          {isCheckingLocation ? (
            "Checking your saved location…"
          ) : (
            <>
              Local proposals need a saved location.{" "}
              <Link
                {...buildSettingsNavigation("account")}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Add your location
              </Link>
            </>
          )}
        </p>
      ) : null}
    </fieldset>
  );
}

function AvailabilityChoice({
  checked,
  description,
  disabled,
  icon: Icon,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  disabled: boolean;
  icon: typeof MapPin;
  label: string;
  onCheckedChange: (enabled: boolean) => void;
}) {
  const switchId = `candidate-availability-${label.toLowerCase()}`;

  return (
    <div className="flex min-h-14 items-center justify-between gap-4 border-border/70 border-b py-3 sm:border-y">
      <label htmlFor={switchId} className="flex min-w-0 items-center gap-3">
        <Icon className="size-4 shrink-0 text-forge-teal" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block font-semibold text-ink text-sm">{label}</span>
          <span className="block text-muted-foreground text-xs">
            {description}
          </span>
        </span>
      </label>
      <Switch
        id={switchId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={`${label} group proposals`}
      />
    </div>
  );
}

function SelectedScopes({
  availability,
}: {
  availability: CandidateAvailability;
}) {
  if (!availability.localEnabled && !availability.onlineEnabled) {
    return null;
  }

  const hasAvailableScope =
    availability.canReceiveLocalProposals ||
    availability.canReceiveOnlineProposals;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-semibold text-muted-foreground text-xs">
          Saved choices
        </span>
        {availability.localEnabled ? (
          <StatusPill icon={MapPin} size="sm" surface="soft" tone="neutral">
            Local
          </StatusPill>
        ) : null}
        {availability.onlineEnabled ? (
          <StatusPill icon={Monitor} size="sm" surface="soft" tone="neutral">
            Online
          </StatusPill>
        ) : null}
      </div>

      {availability.lifecycle === "OPEN" && hasAvailableScope ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-semibold text-muted-foreground text-xs">
            Available now
          </span>
          {availability.canReceiveLocalProposals ? (
            <StatusPill icon={MapPin} size="sm" surface="soft" tone="teal">
              Local
            </StatusPill>
          ) : null}
          {availability.canReceiveOnlineProposals ? (
            <StatusPill icon={Monitor} size="sm" surface="soft" tone="teal">
              Online
            </StatusPill>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AvailabilityLimits({
  availability,
}: {
  availability: CandidateAvailability;
}) {
  const limits = getAvailabilityLimits(availability);
  if (limits.length === 0) return null;

  return (
    <ul className="grid gap-3" aria-label="Current proposal limits">
      {limits.map((limit) => (
        <li key={limit.label} className="flex items-start gap-3 text-sm">
          <StatusPill size="xs" surface="soft" tone={limit.tone}>
            {limit.label}
          </StatusPill>
          <span className="text-muted-foreground leading-relaxed">
            {limit.description}
          </span>
        </li>
      ))}
    </ul>
  );
}

function AvailabilityExpiry({
  availability,
}: {
  availability: CandidateAvailability;
}) {
  if (!availability.availableUntil) return null;

  return (
    <p className="flex items-center gap-2 text-muted-foreground text-sm">
      <Clock3 className="size-4 shrink-0 text-forge-teal" aria-hidden="true" />
      <span>
        {availability.lifecycle === "OPEN"
          ? "Open until"
          : "Last confirmed until"}{" "}
        <strong className="font-semibold text-ink">
          {formatDate(availability.availableUntil)}
        </strong>
      </span>
    </p>
  );
}

function AvailabilityActions({
  availability,
  hasSavedLocation,
  isCheckingLocation,
  localEnabled,
  onlineEnabled,
  state,
}: {
  availability: CandidateAvailability;
  hasSavedLocation: boolean;
  isCheckingLocation: boolean;
  localEnabled: boolean;
  onlineEnabled: boolean;
  state: CandidateAvailabilityState;
}) {
  const actionDisabled = isAvailabilityActionDisabled(state);
  const hasScope = localEnabled || onlineEnabled;
  const localScopeUnavailable =
    localEnabled && (!hasSavedLocation || isCheckingLocation);

  if (availability.lifecycle === "RESTRICTED") {
    return (
      <p className="text-muted-foreground text-sm">
        This setting is read-only while your account is restricted. Review your{" "}
        <Link
          {...buildSettingsNavigation("account")}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          account settings
        </Link>{" "}
        for any current notice.
      </p>
    );
  }

  if (
    availability.lifecycle === "PAUSED" ||
    availability.lifecycle === "EXPIRED"
  ) {
    return (
      <ActionDialog
        cancelLabel="Not now"
        confirmLabel="Confirm I’m open"
        description="This renews your saved local and online choices for another 30 days. You still review every proposal before deciding whether to join."
        disabled={actionDisabled || !hasScope || localScopeUnavailable}
        loading={state.activeAction === "reconfirm"}
        onConfirm={() =>
          state.onReconfirm(availability.policyVersion, availability.revision)
        }
        title="Open to group proposals again?"
        trigger={
          <Button
            className="w-fit"
            disabled={actionDisabled || !hasScope || localScopeUnavailable}
          >
            <RefreshCcw className="size-4" aria-hidden="true" />
            Confirm I’m still open
          </Button>
        }
      />
    );
  }

  if (availability.lifecycle === "OPEN") {
    return (
      <ActionDialog
        cancelLabel="Stay open"
        confirmLabel="Pause proposals"
        description="Pausing stops TeamForge from sending you new group proposals. It does not remove you from a proposal or group you already have."
        disabled={actionDisabled}
        loading={state.activeAction === "pause"}
        onConfirm={() =>
          state.onPause(availability.policyVersion, availability.revision)
        }
        title="Pause new group proposals?"
        trigger={
          <Button variant="outline" className="w-fit" disabled={actionDisabled}>
            <Pause className="size-4" aria-hidden="true" />
            Pause new proposals
          </Button>
        }
      />
    );
  }

  return (
    <ActionDialog
      cancelLabel="Go back"
      confirmLabel="Allow proposals"
      description="This saves where TeamForge may consider you for a group proposal for the next 30 days. You review every proposal before deciding whether to join."
      disabled={actionDisabled || !hasScope || localScopeUnavailable}
      loading={state.activeAction === "update"}
      onConfirm={() =>
        state.onUpdate({
          expectedRevision: null,
          localEnabled,
          onlineEnabled,
          policyVersion: availability.policyVersion,
        })
      }
      title="Allow group proposals?"
      trigger={
        <Button
          className="w-fit"
          disabled={actionDisabled || !hasScope || localScopeUnavailable}
        >
          Allow group proposals
        </Button>
      }
    />
  );
}

function isAvailabilityActionDisabled(state: CandidateAvailabilityState) {
  return !state.isOnline || state.isStateError || state.activeAction !== null;
}

function getAvailabilityView(availability: CandidateAvailability) {
  if (availability.lifecycle === "OPEN") {
    const canReceiveProposal =
      availability.canReceiveLocalProposals ||
      availability.canReceiveOnlineProposals;

    if (!canReceiveProposal) {
      return {
        description:
          "Your choices are saved, but TeamForge cannot send you a new proposal right now.",
        label: "Waiting",
        title: "Your proposal choices are saved",
        tone: "amber" as const,
      };
    }

    return {
      description:
        "TeamForge can send a proposal for the available choices shown below. You decide whether to join.",
      label: "Available",
      title: "You’re open to a group proposal",
      tone: "teal" as const,
    };
  }

  if (availability.lifecycle === "PAUSED") {
    return {
      description:
        "New proposals are paused. Confirm when you want TeamForge to consider you again.",
      label: "Paused",
      title: "Group proposals are paused",
      tone: "muted" as const,
    };
  }

  if (availability.lifecycle === "EXPIRED") {
    return {
      description:
        "Your last confirmation ended. Confirm again if you still want group proposals.",
      label: "Confirm again",
      title: "Are you still open to a proposal?",
      tone: "muted" as const,
    };
  }

  if (availability.lifecycle === "RESTRICTED") {
    return {
      description:
        "TeamForge cannot send new group proposals to this account right now.",
      label: "Unavailable",
      title: "Group proposals are unavailable",
      tone: "muted" as const,
    };
  }

  if (availability.legacyAvailabilityPrompt) {
    return {
      description:
        "Your previous group-formation setting needs a review. Choose local activities, online activities, or both, then confirm what you want now.",
      label: "Review needed",
      title: "Review your group proposal choices",
      tone: "amber" as const,
    };
  }

  return {
    description:
      "Choose local activities, online activities, or both. You decide on every proposal before joining.",
    label: "Not enabled",
    title: "Choose whether you’re open",
    tone: "muted" as const,
  };
}

function getAvailabilityLimits(availability: CandidateAvailability) {
  const limits: Array<{
    description: string;
    label: string;
    tone: "amber" | "neutral" | "teal";
  }> = [];
  const cooldownIsActive =
    availability.proposalCooldownUntil !== null &&
    new Date(availability.proposalCooldownUntil).getTime() > Date.now();

  if (availability.liveAutomaticGroupCount === 1) {
    limits.push({
      description:
        "You already have a current group from this flow. New proposals wait while that group is active.",
      label: "Current group",
      tone: "teal",
    });
  }

  if (availability.reservedSeatCount === 1) {
    limits.push({
      description:
        "A current proposal is holding one place for you. New proposals wait until it closes.",
      label: "Place reserved",
      tone: "amber",
    });
  }

  if (cooldownIsActive && availability.proposalCooldownUntil) {
    limits.push({
      description: `Another proposal can be sent after ${formatDate(
        availability.proposalCooldownUntil,
      )}.`,
      label: "Waiting period",
      tone: "neutral",
    });
  }

  if (
    availability.lifecycle === "OPEN" &&
    !availability.canReceiveLocalProposals &&
    !availability.canReceiveOnlineProposals &&
    limits.length === 0
  ) {
    limits.push({
      description:
        "Your choices remain saved, but TeamForge cannot send another proposal yet. Check back later.",
      label: "Waiting",
      tone: "neutral",
    });
  }

  return limits;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
