import { LogOut, ShieldAlert } from "lucide-react";

import type {
  GroupStatus,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";

import { ConfirmGroupActionButton } from "./confirm-group-action-button";
import { canDisbandGroup, isGroupActionsLocked } from "./group-action-rules";

interface ActionsSectionProps {
  currentUserRole: MemberRole;
  groupStatus: GroupStatus;
  isDisbanding?: boolean;
  isOnline?: boolean;
  isLeaving?: boolean;
  onDisbandGroup: () => Promise<void> | void;
  onLeaveGroup: () => Promise<void> | void;
}

export function ActionsSection({
  currentUserRole,
  groupStatus,
  isDisbanding = false,
  isOnline = true,
  isLeaving = false,
  onDisbandGroup,
  onLeaveGroup,
}: ActionsSectionProps) {
  const actionsLocked = isGroupActionsLocked(groupStatus);
  const canDisband = canDisbandGroup(currentUserRole, groupStatus);

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

      {!actionsLocked && (
        <ConfirmGroupActionButton
          confirmActionLabel={isLeaving ? "Leaving..." : "Leave group"}
          confirmDescription="You’ll leave this group and lose access to its chat and planning workspace."
          confirmTitle="Leave this group?"
          disabled={!isOnline || isLeaving || isDisbanding}
          icon={<LogOut className="size-4" />}
          label={isLeaving ? "Leaving..." : "Leave group"}
          onConfirm={onLeaveGroup}
          title={isOnline ? undefined : "Reconnect before leaving this group."}
          variant="destructive"
        />
      )}

      {canDisband && (
        <ConfirmGroupActionButton
          confirmActionLabel={isDisbanding ? "Disbanding..." : "Disband group"}
          confirmDescription="This will close the group for everyone, cancel unfinished plans, and remove access to the shared workspace."
          confirmTitle="Disband this group?"
          disabled={!isOnline || isDisbanding || isLeaving}
          icon={<ShieldAlert className="size-4" />}
          label={isDisbanding ? "Disbanding..." : "Disband group"}
          onConfirm={onDisbandGroup}
          title={
            isOnline ? undefined : "Reconnect before disbanding this group."
          }
          variant="destructive"
        />
      )}

      {!isOnline && !actionsLocked ? (
        <OfflineNotice
          withIcon={false}
          tone="neutral"
          size="md"
          className="border-border/70 bg-muted/20 px-4 text-slate-muted"
        >
          Reconnect before changing group membership.
        </OfflineNotice>
      ) : null}

      {actionsLocked ? (
        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
          <p className="font-medium text-slate-muted text-sm">
            This group is closed, so membership controls are unavailable.
          </p>
        </div>
      ) : null}
    </section>
  );
}
