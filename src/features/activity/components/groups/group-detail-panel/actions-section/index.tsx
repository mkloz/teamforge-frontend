import { BellOff, Flag, LogOut, ShieldAlert } from "lucide-react";

import type {
  GroupStatus,
  MemberRole,
} from "@/features/activity/lib/activity-contract";

import { ConfirmGroupActionButton } from "./confirm-group-action-button";
import { GroupActionButton } from "./group-action-button";
import { canDisbandGroup, isGroupActionsLocked } from "./group-action-rules";

interface ActionsSectionProps {
  currentUserRole: MemberRole;
  groupStatus: GroupStatus;
  isDisbanding?: boolean;
  isLeaving?: boolean;
  onDisbandGroup: () => Promise<void> | void;
  onLeaveGroup: () => Promise<void> | void;
}

export function ActionsSection({
  currentUserRole,
  groupStatus,
  isDisbanding = false,
  isLeaving = false,
  onDisbandGroup,
  onLeaveGroup,
}: ActionsSectionProps) {
  const actionsLocked = isGroupActionsLocked(groupStatus);
  const canDisband = canDisbandGroup(currentUserRole, groupStatus);

  return (
    <section className="flex flex-col gap-2">
      <h3 className="mb-3 text-sm font-bold tracking-widest text-foreground uppercase">
        Actions
      </h3>

      {!actionsLocked && (
        <GroupActionButton
          icon={<BellOff className="size-4" />}
          label="Mute Notifications"
          onClick={() => {
            // Kept as a visible future affordance until notification preferences land.
          }}
        />
      )}

      <div className="my-2.5 border-t border-border" />

      {!actionsLocked && (
        <ConfirmGroupActionButton
          confirmActionLabel={isLeaving ? "Leaving..." : "Leave Group"}
          confirmDescription="You’ll leave this group and lose access to its chat and planning workspace."
          confirmTitle="Leave this group?"
          disabled={isLeaving || isDisbanding}
          icon={<LogOut className="size-4" />}
          label={isLeaving ? "Leaving..." : "Leave Group"}
          onConfirm={onLeaveGroup}
          variant="destructive"
        />
      )}

      {canDisband && (
        <ConfirmGroupActionButton
          confirmActionLabel={isDisbanding ? "Disbanding..." : "Disband Group"}
          confirmDescription="This will close the group for everyone, cancel unfinished plans, and remove access to the shared workspace."
          confirmTitle="Disband this group?"
          disabled={isDisbanding || isLeaving}
          icon={<ShieldAlert className="size-4" />}
          label={isDisbanding ? "Disbanding..." : "Disband Group"}
          onConfirm={onDisbandGroup}
          variant="destructive"
        />
      )}

      <GroupActionButton
        icon={<Flag className="size-4" />}
        label="Report Group"
        onClick={() => {
          // TODO: wire report flow when moderation endpoints exist.
        }}
        variant="muted"
      />
    </section>
  );
}
