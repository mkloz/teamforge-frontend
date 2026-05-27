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
        <h3 id="members-heading" className="font-bold text-foreground text-sm">
          Members{" "}
          <span className="ml-1 font-medium text-muted-foreground/60">
            {memberCountString}
          </span>
        </h3>
        {canInvite ? (
          <InviteMembersDialog
            candidates={inviteCandidates}
            invitingMemberId={invitingMemberId}
            onInvite={(memberId) => onInviteMember?.(memberId)}
          />
        ) : null}
      </div>

      <div className="divide-y divide-border/70 border-border/70 border-y">
        {members.map((member) => (
          <MemberCard
            key={member.userId}
            canRemove={
              !isReadOnly &&
              currentUserRole === "ADMIN" &&
              currentUserId !== null &&
              member.userId !== currentUserId
            }
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
