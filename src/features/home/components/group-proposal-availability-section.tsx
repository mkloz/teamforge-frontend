import { Link } from "@tanstack/react-router";
import { Clock3, MapPin, Monitor, Pause, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import {
  type GroupProposalAvailability,
  type GroupProposalAvailabilityState,
  useGroupProposalAvailability,
} from "@/features/plan-creation/public/group-proposal-availability";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import { buildSettingsNavigation } from "@/shared/navigation";

const SECTION_HEADING_ID = "group-proposal-availability-heading";

export function GroupProposalAvailabilitySection() {
  const state = useGroupProposalAvailability({ enabled: true });
  const currentUserQuery = useCurrentUserQuery();

  if (state.isLoading) {
    return <GroupProposalAvailabilityLoading />;
  }

  if (state.isLoadError || !state.availability) {
    return <GroupProposalAvailabilityError onRetry={state.onRetry} />;
  }

  const hasSavedLocation =
    currentUserQuery.data?.locationLat != null &&
    currentUserQuery.data.locationLng != null;

  return (
    <GroupProposalAvailabilityContent
      availability={state.availability}
      hasSavedLocation={hasSavedLocation}
      isCheckingLocation={currentUserQuery.isLoading}
      state={state}
    />
  );
}

function GroupProposalAvailabilityLoading() {
  return (
    <section
      className="grid gap-4"
      aria-label="Loading group proposal availability"
      role="status"
    >
      <Skeleton className="h-5 w-32" />
      <div className="grouped-surface grid overflow-hidden rounded-2xl">
        <Skeleton className="h-16 rounded-b-none" />
        <Skeleton className="h-16 rounded-t-none" />
      </div>
      <span className="sr-only">Loading group proposal availability</span>
    </section>
  );
}

function GroupProposalAvailabilityError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="grid gap-3" aria-label="Group proposals" role="alert">
      <HomeSectionHeading title="Group proposals" />
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

function GroupProposalAvailabilityContent({
  availability,
  hasSavedLocation,
  isCheckingLocation,
  state,
}: {
  availability: GroupProposalAvailability;
  hasSavedLocation: boolean;
  isCheckingLocation: boolean;
  state: GroupProposalAvailabilityState;
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
        title={view.title}
        description={view.description}
        action={
          <StatusPill size="sm" surface="soft" tone={view.tone}>
            {view.label}
          </StatusPill>
        }
      />

      <div className="grid gap-4">
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

        {availability.lifecycle === "RESTRICTED" ? (
          <AvailabilityActions
            availability={availability}
            hasSavedLocation={hasSavedLocation}
            isCheckingLocation={isCheckingLocation}
            localEnabled={localEnabled}
            onlineEnabled={onlineEnabled}
            state={state}
          />
        ) : (
          <div className="main-action-grid grid items-center gap-3 border-border/70 border-t pt-4">
            <p className="font-medium text-muted-foreground text-sm leading-5">
              {getAvailabilityActionSummary({
                availability,
                hasSavedLocation,
                isCheckingLocation,
                localEnabled,
                onlineEnabled,
              })}
            </p>
            <div className="sm:justify-self-end">
              <AvailabilityActions
                availability={availability}
                hasSavedLocation={hasSavedLocation}
                isCheckingLocation={isCheckingLocation}
                localEnabled={localEnabled}
                onlineEnabled={onlineEnabled}
                state={state}
              />
            </div>
          </div>
        )}
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
    <fieldset className="grid gap-3">
      <legend className="mb-3 font-semibold text-ink text-sm">
        Where proposals can happen
      </legend>
      <GroupedMenuList>
        <AvailabilityChoice
          checked={localEnabled}
          description="Activities near your saved area"
          disabled={actionDisabled}
          icon={MapPin}
          label="Local"
          onCheckedChange={onLocalChange}
        />
        <AvailabilityChoice
          checked={onlineEnabled}
          description="Remote activities you can join anywhere"
          disabled={actionDisabled}
          icon={Monitor}
          label="Online"
          onCheckedChange={onOnlineChange}
        />
      </GroupedMenuList>

      {localEnabled && !hasSavedLocation ? (
        <p className="text-muted-foreground text-sm">
          {isCheckingLocation ? (
            "Checking your saved location…"
          ) : (
            <>
              Local proposals need a saved location.{" "}
              <Link
                {...buildSettingsNavigation("account")}
                className="font-semibold text-foreground underline-offset-4 hover:underline"
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
  description?: string;
  disabled: boolean;
  icon: typeof MapPin;
  label: string;
  onCheckedChange: (enabled: boolean) => void;
}) {
  const switchId = `group-proposal-availability-${label.toLowerCase()}`;

  return (
    <GroupedMenuItem>
      <GroupedMenuAction
        selected={checked}
        className="min-h-16 gap-3 px-4 py-3 sm:px-5"
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            checked ? "text-foreground" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <label htmlFor={switchId} className="min-w-0 flex-1 cursor-pointer">
          <span className="block font-semibold text-ink text-sm">{label}</span>
          {description ? (
            <span className="mt-0.5 block text-muted-foreground text-xs leading-5">
              {description}
            </span>
          ) : null}
        </label>
        <Switch
          id={switchId}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          aria-label={`${label} group proposals`}
        />
      </GroupedMenuAction>
    </GroupedMenuItem>
  );
}

function SelectedScopes({
  availability,
}: {
  availability: GroupProposalAvailability;
}) {
  if (!availability.localEnabled && !availability.onlineEnabled) {
    return null;
  }

  const hasAvailableScope =
    availability.canReceiveLocalProposals ||
    availability.canReceiveOnlineProposals;
  const showAvailableScopes =
    availability.lifecycle === "OPEN" && hasAvailableScope;
  const showLocal = showAvailableScopes
    ? availability.canReceiveLocalProposals
    : availability.localEnabled;
  const showOnline = showAvailableScopes
    ? availability.canReceiveOnlineProposals
    : availability.onlineEnabled;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-semibold text-muted-foreground text-xs">
        {showAvailableScopes ? "Available now" : "Saved choices"}
      </span>
      {showLocal ? (
        <StatusPill
          icon={MapPin}
          size="sm"
          surface="soft"
          tone={showAvailableScopes ? "teal" : "neutral"}
        >
          Local
        </StatusPill>
      ) : null}
      {showOnline ? (
        <StatusPill
          icon={Monitor}
          size="sm"
          surface="soft"
          tone={showAvailableScopes ? "teal" : "neutral"}
        >
          Online
        </StatusPill>
      ) : null}
    </div>
  );
}

function AvailabilityLimits({
  availability,
}: {
  availability: GroupProposalAvailability;
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
  availability: GroupProposalAvailability;
}) {
  if (!availability.availableUntil) return null;

  return (
    <p className="flex items-center gap-2 text-muted-foreground text-sm">
      <Clock3 className="size-4 shrink-0 text-foreground" aria-hidden="true" />
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
  availability: GroupProposalAvailability;
  hasSavedLocation: boolean;
  isCheckingLocation: boolean;
  localEnabled: boolean;
  onlineEnabled: boolean;
  state: GroupProposalAvailabilityState;
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
          className="font-semibold text-foreground underline-offset-4 hover:underline"
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
            className="w-full sm:w-fit"
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
        description="Pausing stops Findafew from sending you new group proposals. It does not remove you from a proposal or group you already have."
        disabled={actionDisabled}
        loading={state.activeAction === "pause"}
        onConfirm={() =>
          state.onPause(availability.policyVersion, availability.revision)
        }
        title="Pause new group proposals?"
        trigger={
          <Button
            variant="outline"
            className="w-full sm:w-fit"
            disabled={actionDisabled}
          >
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
      description="This saves where Findafew may consider you for a group proposal for the next 30 days. You review every proposal before deciding whether to join."
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
          className="w-full sm:w-fit"
          disabled={actionDisabled || !hasScope || localScopeUnavailable}
        >
          Turn on proposals
        </Button>
      }
    />
  );
}

function isAvailabilityActionDisabled(state: GroupProposalAvailabilityState) {
  return !state.isOnline || state.isStateError || state.activeAction !== null;
}

function getAvailabilityView(availability: GroupProposalAvailability) {
  if (availability.lifecycle === "OPEN") {
    const canReceiveProposal =
      availability.canReceiveLocalProposals ||
      availability.canReceiveOnlineProposals;

    if (!canReceiveProposal) {
      return {
        description: "A current limit is holding new proposals.",
        label: "Waiting",
        title: "Group proposals",
        tone: "amber" as const,
      };
    }

    return {
      description:
        "Findafew can consider you for relevant groups. You still decide whether to join.",
      label: "On",
      title: "Group proposals",
      tone: "teal" as const,
    };
  }

  if (availability.lifecycle === "PAUSED") {
    return {
      description: "Your saved choices will be ready when you turn this on.",
      label: "Paused",
      title: "Group proposals",
      tone: "muted" as const,
    };
  }

  if (availability.lifecycle === "EXPIRED") {
    return {
      description: "Confirm that you still want to hear about relevant groups.",
      label: "Confirm again",
      title: "Group proposals",
      tone: "muted" as const,
    };
  }

  if (availability.lifecycle === "RESTRICTED") {
    return {
      description: undefined,
      label: "Unavailable",
      title: "Group proposals",
      tone: "muted" as const,
    };
  }

  return {
    description:
      "Let Findafew consider you for relevant groups. You still decide whether to join.",
    label: "Off",
    title: "Group proposals",
    tone: "muted" as const,
  };
}

function getAvailabilityActionSummary({
  availability,
  hasSavedLocation,
  isCheckingLocation,
  localEnabled,
  onlineEnabled,
}: {
  availability: GroupProposalAvailability;
  hasSavedLocation: boolean;
  isCheckingLocation: boolean;
  localEnabled: boolean;
  onlineEnabled: boolean;
}) {
  if (availability.lifecycle === "PAUSED") {
    return "Your local and online choices stay saved.";
  }

  if (availability.lifecycle === "EXPIRED") {
    return "Renew your saved choices for another 30 days.";
  }

  if (localEnabled && onlineEnabled) {
    return "Local and online proposals.";
  }

  if (localEnabled) {
    if (isCheckingLocation) {
      return "Checking your saved location…";
    }

    return hasSavedLocation
      ? "Proposals near your saved area."
      : "Add your location to use local proposals.";
  }

  if (onlineEnabled) {
    return "Online proposals only.";
  }

  return "Choose local, online, or both.";
}

function getAvailabilityLimits(availability: GroupProposalAvailability) {
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
        "Your choices remain saved, but Findafew cannot send another proposal yet. Check back later.",
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
