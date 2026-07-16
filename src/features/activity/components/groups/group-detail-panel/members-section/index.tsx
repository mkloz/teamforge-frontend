import type {
  ActivityParticipant,
  GroupMember,
  MemberRole,
} from "@/features/activity/lib/activity-contract";

import { InviteMembersDialog } from "./invite-members-dialog";
import { MemberCard } from "./member-card";

interface MembersSectionProps {
  canInviteMembers?: boolean;
  canRemoveMembers?: boolean;
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

interface MembersSectionViewState {
  canInvite: boolean;
  memberCountString: string;
  showOfflineMemberActionWarning: boolean;
}

interface MembersSectionViewStateInput {
  canInviteMembers?: boolean;
  currentUserRole: MemberRole;
  inviteCandidates: ActivityParticipant[];
  isOnline: boolean;
  isReadOnly: boolean;
  maxMembers: number;
  members: GroupMember[];
  onInviteMember?: MembersSectionProps["onInviteMember"];
}

interface MemberCardRenderState {
  canRemove: boolean;
  isViewer: boolean;
  removing: boolean;
}

interface MemberCardRenderStateInput {
  canRemoveMembers?: boolean;
  currentUserId: string | null;
  currentUserRole: MemberRole;
  isOnline: boolean;
  isReadOnly: boolean;
  member: GroupMember;
  removingMemberId: string | null;
}

interface MembersGridProps {
  canRemoveMembers?: boolean;
  currentUserId: string | null;
  currentUserRole: MemberRole;
  isOnline: boolean;
  isReadOnly: boolean;
  members: GroupMember[];
  onRemoveMember?: MembersSectionProps["onRemoveMember"];
  onShowProfile?: MembersSectionProps["onShowProfile"];
  removingMemberId: string | null;
}

const EMPTY_INVITE_CANDIDATES: ActivityParticipant[] = [];

export function MembersSection({
  canInviteMembers,
  canRemoveMembers,
  inviteCandidates = EMPTY_INVITE_CANDIDATES,
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
  const viewState = getMembersSectionViewState({
    canInviteMembers,
    currentUserRole,
    inviteCandidates,
    isReadOnly,
    maxMembers,
    members,
    onInviteMember,
    isOnline,
  });

  return (
    <section aria-labelledby="members-heading">
      <MembersSectionHeader
        inviteCandidates={inviteCandidates}
        invitingMemberId={invitingMemberId}
        isOnline={isOnline}
        memberCountString={viewState.memberCountString}
        onInviteMember={onInviteMember}
        showInviteAction={viewState.canInvite}
        showOfflineMemberActionWarning={
          viewState.showOfflineMemberActionWarning
        }
      />

      <MembersGrid
        currentUserId={currentUserId}
        canRemoveMembers={canRemoveMembers}
        currentUserRole={currentUserRole}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        members={members}
        onRemoveMember={onRemoveMember}
        onShowProfile={onShowProfile}
        removingMemberId={removingMemberId}
      />
    </section>
  );
}

function getMembersSectionViewState({
  canInviteMembers: canInviteMembersCapability,
  currentUserRole,
  inviteCandidates,
  isOnline,
  isReadOnly,
  maxMembers,
  members,
  onInviteMember,
}: MembersSectionViewStateInput): MembersSectionViewState {
  return {
    canInvite: canInviteMembersForViewer({
      canInviteMembers: canInviteMembersCapability,
      currentUserRole,
      inviteCandidates,
      isReadOnly,
      maxMembers,
      members,
      onInviteMember,
    }),
    memberCountString: `(${members.length}/${maxMembers})`,
    showOfflineMemberActionWarning: shouldShowOfflineMemberActionWarning({
      currentUserRole,
      isOnline,
    }),
  };
}

function canInviteMembersForViewer({
  canInviteMembers,
  currentUserRole,
  inviteCandidates,
  isReadOnly,
  maxMembers,
  members,
  onInviteMember,
}: Omit<MembersSectionViewStateInput, "isOnline">) {
  const inviteRequirements = [
    canInviteMembers ?? currentUserRole !== "MEMBER",
    !isReadOnly,
    members.length < maxMembers,
    inviteCandidates.length > 0,
    onInviteMember !== undefined,
  ];

  return inviteRequirements.every(Boolean);
}

function shouldShowOfflineMemberActionWarning({
  currentUserRole,
  isOnline,
}: Pick<MembersSectionViewStateInput, "currentUserRole" | "isOnline">) {
  return !isOnline && currentUserRole !== "MEMBER";
}

function MembersSectionHeader({
  inviteCandidates,
  invitingMemberId,
  isOnline,
  memberCountString,
  onInviteMember,
  showInviteAction,
  showOfflineMemberActionWarning,
}: {
  inviteCandidates: ActivityParticipant[];
  invitingMemberId: string | null;
  isOnline: boolean;
  memberCountString: string;
  onInviteMember: MembersSectionProps["onInviteMember"];
  showInviteAction: boolean;
  showOfflineMemberActionWarning: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="min-w-0">
        <h3 id="members-heading" className="font-bold text-foreground text-sm">
          Members{" "}
          <span className="ml-1 font-medium text-muted-foreground/60">
            {memberCountString}
          </span>
        </h3>
        {showOfflineMemberActionWarning ? (
          <output className="mt-0.5 block text-slate-muted text-xs">
            Reconnect before changing members.
          </output>
        ) : null}
      </div>
      {showInviteAction ? (
        <InviteMembersDialog
          candidates={inviteCandidates}
          disabled={!isOnline}
          invitingMemberId={invitingMemberId}
          onInvite={(memberId) => onInviteMember?.(memberId)}
        />
      ) : null}
    </div>
  );
}

function MembersGrid({
  canRemoveMembers,
  currentUserId,
  currentUserRole,
  isOnline,
  isReadOnly,
  members,
  onRemoveMember,
  onShowProfile,
  removingMemberId,
}: MembersGridProps) {
  return (
    <div className="grid gap-1.5">
      {members.map((member) => {
        const cardState = getMemberCardRenderState({
          canRemoveMembers,
          currentUserId,
          currentUserRole,
          isOnline,
          isReadOnly,
          member,
          removingMemberId,
        });

        return (
          <MemberCard
            key={member.userId}
            canRemove={cardState.canRemove}
            isViewer={cardState.isViewer}
            member={member}
            onRemove={onRemoveMember}
            onShowProfile={onShowProfile}
            removing={cardState.removing}
          />
        );
      })}
    </div>
  );
}

function getMemberCardRenderState({
  canRemoveMembers,
  currentUserId,
  currentUserRole,
  isOnline,
  isReadOnly,
  member,
  removingMemberId,
}: MemberCardRenderStateInput): MemberCardRenderState {
  return {
    canRemove: canRemoveMember({
      canRemoveMembers,
      currentUserId,
      currentUserRole,
      isOnline,
      isReadOnly,
      member,
    }),
    isViewer: isViewerMember(currentUserId, member),
    removing: removingMemberId === member.userId,
  };
}

function canRemoveMember({
  canRemoveMembers,
  currentUserId,
  currentUserRole,
  isOnline,
  isReadOnly,
  member,
}: Omit<MemberCardRenderStateInput, "removingMemberId">) {
  const removalRequirements = [
    canRemoveMembers ?? currentUserRole === "ADMIN",
    !isReadOnly,
    isOnline,
    currentUserId !== null,
    member.userId !== currentUserId,
  ];

  return removalRequirements.every(Boolean);
}

function isViewerMember(currentUserId: string | null, member: GroupMember) {
  return currentUserId !== null && member.userId === currentUserId;
}
