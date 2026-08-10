import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  MailPlus,
  MapPin,
  RefreshCcw,
  Waypoints,
  Wifi,
} from "lucide-react";
import { useState } from "react";

import type {
  GroupProposalAvailability,
  GroupProposalAvailabilityState,
} from "@/features/plan-creation/public/group-proposal-availability";
import { AvailabilityScopeOption } from "@/features/settings/components/settings-profile-form/availability-scope-option";
import type { ActivityInviteAvailabilityState } from "@/features/settings/hooks/use-activity-invite-availability";
import type { ActivityInviteAvailability } from "@/features/settings/schemas/activity-invite-availability.schema";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Label } from "@/shared/components/ui/label";
import { Notice } from "@/shared/components/ui/notice";
import { Switch } from "@/shared/components/ui/switch";
import { buildSettingsNavigation } from "@/shared/navigation";

interface GroupReachabilityControlProps {
  activityInvites: ActivityInviteAvailabilityState;
  candidateProposals: GroupProposalAvailabilityState;
  hasSavedLocation: boolean;
}

interface ReachabilityScope {
  localEnabled: boolean;
  onlineEnabled: boolean;
}

export function GroupReachabilityControl({
  activityInvites,
  candidateProposals,
  hasSavedLocation,
}: GroupReachabilityControlProps) {
  const proposals = candidateProposals.availability;
  const invitations = activityInvites.availability;

  if (
    candidateProposals.isLoading ||
    activityInvites.isLoading ||
    (!proposals && !candidateProposals.isLoadError) ||
    (!invitations && !activityInvites.isLoadError)
  ) {
    return <ReachabilityLoading />;
  }

  if (!proposals || !invitations) {
    return (
      <ReachabilityLoadError
        retryProposals={candidateProposals.onRetry}
        retryInvitations={activityInvites.onRetry}
      />
    );
  }

  return (
    <GroupReachabilityEditor
      activityInvites={activityInvites}
      candidateProposals={candidateProposals}
      hasSavedLocation={hasSavedLocation}
      invitations={invitations}
      proposals={proposals}
    />
  );
}

interface GroupReachabilityEditorProps extends GroupReachabilityControlProps {
  invitations: ActivityInviteAvailability;
  proposals: GroupProposalAvailability;
}

function GroupReachabilityEditor({
  activityInvites,
  candidateProposals,
  hasSavedLocation,
  invitations,
  proposals,
}: GroupReachabilityEditorProps) {
  const [scope, setScope] = useState<ReachabilityScope>(() =>
    getInitialReachabilityScope({
      hasSavedLocation,
      invitations,
      proposals,
    }),
  );
  const isBusy =
    candidateProposals.activeAction !== null ||
    activityInvites.activeAction !== null;
  const isOffline = !candidateProposals.isOnline || !activityInvites.isOnline;
  const hasInvalidLocalScope = scope.localEnabled && !hasSavedLocation;
  const hasOpenChannel =
    proposals.lifecycle === "OPEN" || invitations.lifecycle === "OPEN";
  const hasScopeChanges =
    (proposals.lifecycle === "OPEN" &&
      getChannelScopeChanged(proposals, scope)) ||
    (invitations.lifecycle === "OPEN" &&
      getChannelScopeChanged(invitations, scope));
  const canSaveScope =
    hasOpenChannel &&
    hasScopeChanges &&
    !hasInvalidLocalScope &&
    !isOffline &&
    !isBusy;

  async function saveScopeForOpenChannels() {
    const updates: Promise<void>[] = [];

    if (
      proposals.lifecycle === "OPEN" &&
      getChannelScopeChanged(proposals, scope)
    ) {
      updates.push(
        candidateProposals.onUpdate({
          expectedRevision: proposals.revision,
          localEnabled: scope.localEnabled,
          onlineEnabled: scope.onlineEnabled,
          policyVersion: proposals.policyVersion,
        }),
      );
    }

    if (
      invitations.lifecycle === "OPEN" &&
      getChannelScopeChanged(invitations, scope)
    ) {
      updates.push(
        activityInvites.onUpdate({
          expectedRevision: invitations.revision,
          localEnabled: scope.localEnabled,
          onlineEnabled: scope.onlineEnabled,
        }),
      );
    }

    await Promise.all(updates);
  }

  return (
    <section
      aria-labelledby="group-reachability-heading"
      className="grid gap-5 rounded-2xl bg-card px-3 py-4 sm:px-5 sm:py-5"
    >
      <header>
        <h3
          id="group-reachability-heading"
          className="flex items-center gap-2 font-bold text-base text-ink"
        >
          <Waypoints className="size-4 text-foreground" aria-hidden="true" />
          Ways groups can reach you
        </h3>
        <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
          Choose where you are open, then decide how groups may contact you.
        </p>
      </header>

      <fieldset className="min-w-0">
        <legend className="mb-2 font-bold text-ink text-sm">
          Where you are open
        </legend>
        <GroupedMenuList>
          <GroupedMenuItem className="bg-background/55">
            <AvailabilityScopeOption
              checked={scope.localEnabled}
              disabled={
                isBusy ||
                isOffline ||
                (!hasSavedLocation && !scope.localEnabled) ||
                (scope.localEnabled && !scope.onlineEnabled)
              }
              icon={MapPin}
              title="Local activities"
              onToggle={() =>
                setScope((current) => ({
                  ...current,
                  localEnabled: !current.localEnabled,
                }))
              }
            />
          </GroupedMenuItem>
          <GroupedMenuItem className="bg-background/55">
            <AvailabilityScopeOption
              checked={scope.onlineEnabled}
              disabled={
                isBusy ||
                isOffline ||
                (scope.onlineEnabled && !scope.localEnabled)
              }
              icon={Wifi}
              title="Online activities"
              onToggle={() =>
                setScope((current) => ({
                  ...current,
                  onlineEnabled: !current.onlineEnabled,
                }))
              }
            />
          </GroupedMenuItem>
        </GroupedMenuList>
      </fieldset>

      <ScopeSupportMessage
        canSaveScope={canSaveScope}
        hasInvalidLocalScope={hasInvalidLocalScope}
        hasOpenChannel={hasOpenChannel}
        hasScopeChanges={hasScopeChanges}
        isBusy={isBusy}
        onSave={() => void saveScopeForOpenChannels()}
      />

      <fieldset className="min-w-0">
        <legend className="mb-2 font-bold text-ink text-sm">
          How groups can contact you
        </legend>
        <GroupedMenuList>
          <ReachabilityChannelOption
            checked={proposals.lifecycle === "OPEN"}
            description="Findafew suggests a group; you review it first."
            disabled={
              isOffline ||
              isBusy ||
              proposals.lifecycle === "RESTRICTED" ||
              hasInvalidLocalScope
            }
            icon={Waypoints}
            title="Group proposals"
            onToggle={(checked) =>
              void updateProposalChannel({
                candidateProposals,
                checked,
                scope,
              })
            }
          />
          <ReachabilityChannelOption
            checked={invitations.lifecycle === "OPEN"}
            description="An organizer invites you; you still decide whether to join."
            disabled={
              isOffline ||
              isBusy ||
              invitations.lifecycle === "RESTRICTED" ||
              hasInvalidLocalScope
            }
            icon={MailPlus}
            title="Direct invitations"
            onToggle={(checked) =>
              void updateInvitationChannel({
                activityInvites,
                checked,
                scope,
              })
            }
          />
        </GroupedMenuList>
      </fieldset>

      <ReachabilityFacts
        activityInvites={activityInvites}
        candidateProposals={candidateProposals}
      />

      <ReachabilityErrors
        activityInvites={activityInvites}
        candidateProposals={candidateProposals}
      />
    </section>
  );
}

function ReachabilityChannelOption({
  checked,
  description,
  disabled,
  icon: Icon,
  onToggle,
  title,
}: {
  checked: boolean;
  description: string;
  disabled: boolean;
  icon: LucideIcon;
  onToggle: (checked: boolean) => void;
  title: string;
}) {
  const switchId = `reachability-${title.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <GroupedMenuItem className="bg-background/55">
      <GroupedMenuAction
        selected={checked}
        className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-3 py-3 sm:gap-4 sm:px-4"
      >
        <Icon
          className={
            checked
              ? "mt-0.5 size-4 text-foreground"
              : "mt-0.5 size-4 text-slate-muted"
          }
          aria-hidden="true"
        />
        <Label
          htmlFor={switchId}
          className={
            disabled
              ? "min-w-0 flex-1 cursor-not-allowed flex-col items-start gap-0.5"
              : "min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5"
          }
        >
          <span className="font-bold text-ink text-sm leading-snug">
            {title}
          </span>
          <span className="block font-normal text-muted-foreground text-xs leading-relaxed">
            {description}
          </span>
        </Label>
        <Switch
          id={switchId}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onToggle}
          aria-label={title}
          className="shrink-0"
        />
      </GroupedMenuAction>
    </GroupedMenuItem>
  );
}

function ScopeSupportMessage({
  canSaveScope,
  hasInvalidLocalScope,
  hasOpenChannel,
  hasScopeChanges,
  isBusy,
  onSave,
}: {
  canSaveScope: boolean;
  hasInvalidLocalScope: boolean;
  hasOpenChannel: boolean;
  hasScopeChanges: boolean;
  isBusy: boolean;
  onSave: () => void;
}) {
  if (hasInvalidLocalScope) {
    return (
      <p className="text-muted-foreground text-sm">
        Local activities need a saved location.{" "}
        <Link
          {...buildSettingsNavigation("account")}
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Add your location
        </Link>
        .
      </p>
    );
  }

  if (hasOpenChannel && hasScopeChanges) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Apply this scope to the contact methods that are currently on.
        </p>
        <Button
          size="compact"
          disabled={!canSaveScope}
          loading={isBusy}
          onClick={onSave}
        >
          Save availability
        </Button>
      </div>
    );
  }

  if (!hasOpenChannel) {
    return (
      <p className="text-muted-foreground text-sm">
        This scope will be used when you turn on a contact method.
      </p>
    );
  }

  return null;
}

function ReachabilityFacts({
  activityInvites,
  candidateProposals,
}: {
  activityInvites: ActivityInviteAvailabilityState;
  candidateProposals: GroupProposalAvailabilityState;
}) {
  const proposals = candidateProposals.availability;
  const invitations = activityInvites.availability;
  const facts = [
    proposals?.lifecycle === "OPEN" && proposals.availableUntil
      ? `Proposals until ${formatDate(proposals.availableUntil)}`
      : null,
    invitations?.lifecycle === "OPEN" && invitations.availableUntil
      ? `Invitations until ${formatDate(invitations.availableUntil)}`
      : null,
    proposals?.proposalCooldownUntil &&
    new Date(proposals.proposalCooldownUntil).getTime() > Date.now()
      ? `Next proposal after ${formatDate(proposals.proposalCooldownUntil)}`
      : null,
  ].filter((fact): fact is string => Boolean(fact));

  if (facts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-border/45 border-t pt-4 text-muted-foreground text-xs">
      <Clock3
        className="size-3.5 shrink-0 text-foreground"
        aria-hidden="true"
      />
      {facts.map((fact, index) => (
        <span key={fact}>
          {index > 0 ? <span className="mr-3 text-border">·</span> : null}
          {fact}
        </span>
      ))}
    </div>
  );
}

function ReachabilityErrors({
  activityInvites,
  candidateProposals,
}: {
  activityInvites: ActivityInviteAvailabilityState;
  candidateProposals: GroupProposalAvailabilityState;
}) {
  const errors = [candidateProposals.error, activityInvites.error].filter(
    (error): error is string => Boolean(error),
  );

  if (errors.length === 0) {
    return null;
  }

  return (
    <Notice tone="danger" size="sm" role="alert">
      {errors.join(" ")}
    </Notice>
  );
}

function ReachabilityLoading() {
  return (
    <section
      className="grid gap-4 rounded-2xl bg-card px-3 py-4 sm:px-5 sm:py-5"
      role="status"
    >
      <div className="h-5 w-48 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
      <div className="h-28 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
      <div className="h-28 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
      <span className="sr-only">Loading group reachability settings</span>
    </section>
  );
}

function ReachabilityLoadError({
  retryInvitations,
  retryProposals,
}: {
  retryInvitations: () => void;
  retryProposals: () => void;
}) {
  return (
    <section className="grid gap-3 rounded-2xl bg-card p-4" role="alert">
      <p className="text-muted-foreground text-sm">
        We could not load how groups can reach you.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => {
          retryProposals();
          retryInvitations();
        }}
      >
        <RefreshCcw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}

function getInitialReachabilityScope({
  hasSavedLocation,
  invitations,
  proposals,
}: {
  hasSavedLocation: boolean;
  invitations: NonNullable<ActivityInviteAvailabilityState["availability"]>;
  proposals: NonNullable<GroupProposalAvailabilityState["availability"]>;
}): ReachabilityScope {
  const openChannels = [proposals, invitations].filter(
    (availability) => availability.lifecycle === "OPEN",
  );
  const channels =
    openChannels.length > 0 ? openChannels : [proposals, invitations];
  const localEnabled = channels.some(
    (availability) => availability.localEnabled,
  );
  const onlineEnabled = channels.some(
    (availability) => availability.onlineEnabled,
  );

  if (localEnabled || onlineEnabled) {
    return { localEnabled, onlineEnabled };
  }

  return {
    localEnabled: hasSavedLocation,
    onlineEnabled: true,
  };
}

function getChannelScopeChanged(
  availability: {
    localEnabled: boolean;
    onlineEnabled: boolean;
  },
  scope: ReachabilityScope,
) {
  return (
    availability.localEnabled !== scope.localEnabled ||
    availability.onlineEnabled !== scope.onlineEnabled
  );
}

async function updateProposalChannel({
  candidateProposals,
  checked,
  scope,
}: {
  candidateProposals: GroupProposalAvailabilityState;
  checked: boolean;
  scope: ReachabilityScope;
}) {
  const availability = candidateProposals.availability;
  if (!availability) {
    return;
  }

  if (!checked && availability.lifecycle === "OPEN") {
    await candidateProposals.onPause(
      availability.policyVersion,
      availability.revision,
    );
    return;
  }

  if (!checked) {
    return;
  }

  if (
    (availability.lifecycle === "PAUSED" ||
      availability.lifecycle === "EXPIRED") &&
    !getChannelScopeChanged(availability, scope)
  ) {
    await candidateProposals.onReconfirm(
      availability.policyVersion,
      availability.revision,
    );
    return;
  }

  await candidateProposals.onUpdate({
    expectedRevision:
      availability.lifecycle === null ? null : availability.revision,
    localEnabled: scope.localEnabled,
    onlineEnabled: scope.onlineEnabled,
    policyVersion: availability.policyVersion,
  });
}

async function updateInvitationChannel({
  activityInvites,
  checked,
  scope,
}: {
  activityInvites: ActivityInviteAvailabilityState;
  checked: boolean;
  scope: ReachabilityScope;
}) {
  const availability = activityInvites.availability;
  if (!availability) {
    return;
  }

  if (!checked && availability.lifecycle === "OPEN") {
    await activityInvites.onPause(availability.revision);
    return;
  }

  if (!checked) {
    return;
  }

  if (
    (availability.lifecycle === "PAUSED" ||
      availability.lifecycle === "EXPIRED") &&
    !getChannelScopeChanged(availability, scope)
  ) {
    await activityInvites.onReconfirm(availability.revision);
    return;
  }

  await activityInvites.onUpdate({
    expectedRevision:
      availability.lifecycle === null ? null : availability.revision,
    localEnabled: scope.localEnabled,
    onlineEnabled: scope.onlineEnabled,
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}
