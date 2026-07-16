import { LogOut, ShieldAlert } from "lucide-react";

import type {
  GroupStatus,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";

import { ConfirmGroupActionButton } from "./confirm-group-action-button";
import { canDisbandGroup, isGroupActionsLocked } from "./group-action-rules";

interface ActionsSectionProps {
  canDisband?: boolean;
  canLeave?: boolean;
  currentUserRole: MemberRole;
  groupStatus: GroupStatus;
  isDisbanding?: boolean;
  isOnline?: boolean;
  isLeaving?: boolean;
  onDisbandGroup: () => Promise<void> | void;
  onLeaveGroup: () => Promise<void> | void;
}

interface GroupMembershipActionState {
  confirmActionLabel: string;
  disabled: boolean;
  label: string;
  title?: string;
}

type GroupMembershipActionKind = "disband" | "leave";

interface GroupMembershipActionCopy {
  offlineTitle: string;
  pendingLabel: string;
  readyLabel: string;
}

interface GroupMembershipActionStateInput {
  isDisbanding: boolean;
  isLeaving: boolean;
  isOnline: boolean;
  kind: GroupMembershipActionKind;
}

const GROUP_MEMBERSHIP_ACTION_COPY = {
  disband: {
    offlineTitle: "Reconnect before disbanding this group.",
    pendingLabel: "Disbanding...",
    readyLabel: "Disband group",
  },
  leave: {
    offlineTitle: "Reconnect before leaving this group.",
    pendingLabel: "Leaving...",
    readyLabel: "Leave group",
  },
} satisfies Record<GroupMembershipActionKind, GroupMembershipActionCopy>;

function getGroupMembershipActionState({
  isDisbanding,
  isLeaving,
  isOnline,
  kind,
}: GroupMembershipActionStateInput): GroupMembershipActionState {
  const copy = GROUP_MEMBERSHIP_ACTION_COPY[kind];
  const label = isMembershipActionPending(kind, {
    isDisbanding,
    isLeaving,
  })
    ? copy.pendingLabel
    : copy.readyLabel;

  return {
    confirmActionLabel: label,
    disabled: isMembershipActionDisabled({
      isDisbanding,
      isLeaving,
      isOnline,
    }),
    label,
    title: getMembershipActionTitle(isOnline, copy),
  };
}

function isMembershipActionPending(
  kind: GroupMembershipActionKind,
  {
    isDisbanding,
    isLeaving,
  }: Pick<GroupMembershipActionStateInput, "isDisbanding" | "isLeaving">,
) {
  const pendingByKind = {
    disband: isDisbanding,
    leave: isLeaving,
  } satisfies Record<GroupMembershipActionKind, boolean>;

  return pendingByKind[kind];
}

function isMembershipActionDisabled({
  isDisbanding,
  isLeaving,
  isOnline,
}: Pick<
  GroupMembershipActionStateInput,
  "isDisbanding" | "isLeaving" | "isOnline"
>) {
  return !isOnline || isLeaving || isDisbanding;
}

function getMembershipActionTitle(
  isOnline: boolean,
  copy: GroupMembershipActionCopy,
) {
  return isOnline ? undefined : copy.offlineTitle;
}

export function ActionsSection({
  canDisband: canDisbandCapability,
  canLeave = true,
  currentUserRole,
  groupStatus,
  isDisbanding = false,
  isOnline = true,
  isLeaving = false,
  onDisbandGroup,
  onLeaveGroup,
}: ActionsSectionProps) {
  const actionsLocked = isGroupActionsLocked(groupStatus);
  const canDisband =
    canDisbandCapability ?? canDisbandGroup(currentUserRole, groupStatus);
  const leaveAction = getGroupMembershipActionState({
    isDisbanding,
    isLeaving,
    isOnline,
    kind: "leave",
  });
  const disbandAction = getGroupMembershipActionState({
    isDisbanding,
    isLeaving,
    isOnline,
    kind: "disband",
  });

  return (
    <section className="flex flex-col gap-3" aria-labelledby="group-controls">
      <div className="flex flex-col gap-1">
        <h3 id="group-controls" className="font-bold text-foreground text-sm">
          Membership
        </h3>
        <p className="text-slate-muted text-xs leading-relaxed">
          Manage your access to this group chat and plan.
        </p>
      </div>

      <MembershipActionButtons
        actionsLocked={actionsLocked}
        canDisband={canDisband}
        canLeave={canLeave}
        disbandAction={disbandAction}
        leaveAction={leaveAction}
        onDisbandGroup={onDisbandGroup}
        onLeaveGroup={onLeaveGroup}
      />

      <MembershipActionNotices
        actionsLocked={actionsLocked}
        isOnline={isOnline}
      />
    </section>
  );
}

function MembershipActionButtons({
  actionsLocked,
  canDisband,
  canLeave,
  disbandAction,
  leaveAction,
  onDisbandGroup,
  onLeaveGroup,
}: {
  actionsLocked: boolean;
  canDisband: boolean;
  canLeave: boolean;
  disbandAction: GroupMembershipActionState;
  leaveAction: GroupMembershipActionState;
  onDisbandGroup: ActionsSectionProps["onDisbandGroup"];
  onLeaveGroup: ActionsSectionProps["onLeaveGroup"];
}) {
  return (
    <>
      {!actionsLocked && canLeave ? (
        <ConfirmGroupActionButton
          confirmActionLabel={leaveAction.confirmActionLabel}
          confirmDescription="You’ll leave this group and lose access to its chat and planning workspace."
          confirmTitle="Leave this group?"
          disabled={leaveAction.disabled}
          icon={<LogOut className="size-4" />}
          label={leaveAction.label}
          onConfirm={onLeaveGroup}
          title={leaveAction.title}
          variant="destructive"
        />
      ) : null}

      {canDisband && (
        <ConfirmGroupActionButton
          confirmActionLabel={disbandAction.confirmActionLabel}
          confirmDescription="This will close the group for everyone, cancel unfinished plans, and remove access to the shared workspace."
          confirmTitle="Disband this group?"
          disabled={disbandAction.disabled}
          icon={<ShieldAlert className="size-4" />}
          label={disbandAction.label}
          onConfirm={onDisbandGroup}
          title={disbandAction.title}
          variant="destructive"
        />
      )}
    </>
  );
}

function MembershipActionNotices({
  actionsLocked,
  isOnline,
}: {
  actionsLocked: boolean;
  isOnline: boolean;
}) {
  if (!isOnline && !actionsLocked) {
    return (
      <OfflineNotice
        withIcon={false}
        tone="neutral"
        size="md"
        className="border-border/70 bg-muted/20 px-4 text-slate-muted"
      >
        Reconnect before changing group membership.
      </OfflineNotice>
    );
  }

  if (actionsLocked) {
    return (
      <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
        <p className="font-medium text-slate-muted text-sm">
          This group is closed, so membership controls are unavailable.
        </p>
      </div>
    );
  }

  return null;
}
