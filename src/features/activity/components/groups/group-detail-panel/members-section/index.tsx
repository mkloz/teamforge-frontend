import type {
  ActivityParticipant,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { MemberCard } from "./member-card";
import { InviteMembersDialog } from "./invite-members-dialog";

interface MembersSectionProps {
  inviteCandidates?: ActivityParticipant[];
  invitingMemberId?: string | null;
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
    members.length < maxMembers &&
    inviteCandidates.length > 0 &&
    currentUserRole !== "MEMBER" &&
    onInviteMember !== undefined;
  const memberCountString = `(${members.length}/${maxMembers})`;

  return (
    <section aria-labelledby="members-heading">
      <div className="flex items-center justify-between mb-3">
        <h3
          id="members-heading"
          className="text-sm font-bold text-foreground uppercase tracking-widest"
        >
          Members{" "}
          <span className="text-muted-foreground/60 font-medium ml-1">
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

      <div className="space-y-3">
        {members.map((member) => (
          <MemberCard
            key={member.userId}
            canRemove={
              currentUserRole === "ADMIN" &&
              currentUserId !== null &&
              member.userId !== currentUserId
            }
            member={member}
            onRemove={onRemoveMember}
            onShowProfile={onShowProfile}
            removing={removingMemberId === member.userId}
          />
        ))}
      </div>
    </section>
  );
}
