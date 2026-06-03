import type {
  ActivityParticipant,
  GroupMember,
  MemberRole,
} from "@/features/activity/lib/activity-contract";

import { InviteMembersDialog } from "./invite-members-dialog";
import { MemberCard } from "./member-card";

interface MembersSectionProps {
  inviteCandidates?: ActivityParticipant[];
  invitingMemberId?: string | null;
  isOnline?: boolean;
  isReadOnly?: boolean;
  members: GroupMember[];
  maxMembers: number;
  currentUserId: string | null;
  currentUserRole: MemberRole;
  onInviteMember?: (memberId: string) => Promise<void> | void;
  removingMemberId?: string | null;
  onRemoveMember?: (memberId: string) => Promise<void> | void;
  onShowProfile?: (member: GroupMember) => void;
}

export function MembersSection({
  inviteCandidates = [],
  invitingMemberId = null,
  isOnline = true,
  isReadOnly = false,
  members,
  maxMembers,
  currentUserId,
  currentUserRole,
  onInviteMember,
  removingMemberId = null,
  onRemoveMember,
  onShowProfile,
}: MembersSectionProps) {
  const canInvite =
    !isReadOnly &&
    members.length < maxMembers &&
    inviteCandidates.length > 0 &&
    currentUserRole !== "MEMBER" &&
    onInviteMember !== undefined;
  const memberCountString = `(${members.length}/${maxMembers})`;
  const showMemberFit = members.length > 1;

  return (
    <section aria-labelledby="members-heading">
      <div className="mb-3 flex items-center justify-between">
        <div className="min-w-0">
          <h3
            id="members-heading"
            className="font-bold text-foreground text-sm"
          >
            Members{" "}
            <span className="ml-1 font-medium text-muted-foreground/60">
              {memberCountString}
            </span>
          </h3>
          {!isOnline && currentUserRole !== "MEMBER" ? (
            <p role="status" className="mt-0.5 text-slate-muted text-xs">
              Reconnect before changing members.
            </p>
          ) : null}
        </div>
        {canInvite ? (
          <InviteMembersDialog
            candidates={inviteCandidates}
            disabled={!isOnline}
            invitingMemberId={invitingMemberId}
            onInvite={(memberId) => onInviteMember?.(memberId)}
          />
        ) : null}
      </div>

      <div className="grid gap-1.5">
        {members.map((member) => (
          <MemberCard
            key={member.userId}
            canRemove={
              !isReadOnly &&
              isOnline &&
              currentUserRole === "ADMIN" &&
              currentUserId !== null &&
              member.userId !== currentUserId
            }
            isViewer={currentUserId !== null && member.userId === currentUserId}
            member={member}
            onRemove={onRemoveMember}
            onShowProfile={onShowProfile}
            removing={removingMemberId === member.userId}
            showFit={showMemberFit}
          />
        ))}
      </div>
    </section>
  );
}
