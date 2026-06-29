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

interface MembersSectionViewState {
  canInvite: boolean;
  memberCountString: string;
  showMemberFit: boolean;
  showOfflineMemberActionWarning: boolean;
}

interface MembersSectionViewStateInput {
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
  currentUserId: string | null;
  currentUserRole: MemberRole;
  isOnline: boolean;
  isReadOnly: boolean;
  member: GroupMember;
  removingMemberId: string | null;
}

interface MembersGridProps {
  currentUserId: string | null;
  currentUserRole: MemberRole;
  isOnline: boolean;
  isReadOnly: boolean;
  members: GroupMember[];
  onRemoveMember?: MembersSectionProps["onRemoveMember"];
  onShowProfile?: MembersSectionProps["onShowProfile"];
  removingMemberId: string | null;
  showMemberFit: boolean;
}

const EMPTY_INVITE_CANDIDATES: ActivityParticipant[] = [];

export function MembersSection({
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
        currentUserRole={currentUserRole}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        members={members}
        onRemoveMember={onRemoveMember}
        onShowProfile={onShowProfile}
        removingMemberId={removingMemberId}
        showMemberFit={viewState.showMemberFit}
      />
    </section>
  );
}

function getMembersSectionViewState({
  currentUserRole,
  inviteCandidates,
  isOnline,
  isReadOnly,
  maxMembers,
  members,
  onInviteMember,
}: MembersSectionViewStateInput): MembersSectionViewState {
  return {
    canInvite: canInviteMembers({
      currentUserRole,
      inviteCandidates,
      isReadOnly,
      maxMembers,
      members,
      onInviteMember,
    }),
    memberCountString: `(${members.length}/${maxMembers})`,
    showMemberFit: shouldShowMemberFit(members),
    showOfflineMemberActionWarning: shouldShowOfflineMemberActionWarning({
      currentUserRole,
      isOnline,
    }),
  };
}

function canInviteMembers({
  currentUserRole,
  inviteCandidates,
  isReadOnly,
  maxMembers,
  members,
  onInviteMember,
}: Omit<MembersSectionViewStateInput, "isOnline">) {
  const inviteRequirements = [
    !isReadOnly,
    members.length < maxMembers,
    inviteCandidates.length > 0,
    currentUserRole !== "MEMBER",
    onInviteMember !== undefined,
  ];

  return inviteRequirements.every(Boolean);
}

function shouldShowMemberFit(members: GroupMember[]) {
  return members.length > 1;
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
  currentUserId,
  currentUserRole,
  isOnline,
  isReadOnly,
  members,
  onRemoveMember,
  onShowProfile,
  removingMemberId,
  showMemberFit,
}: MembersGridProps) {
  return (
    <div className="grid gap-1.5">
      {members.map((member) => {
        const cardState = getMemberCardRenderState({
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
            showFit={showMemberFit}
          />
        );
      })}
    </div>
  );
}

function getMemberCardRenderState({
  currentUserId,
  currentUserRole,
  isOnline,
  isReadOnly,
  member,
  removingMemberId,
}: MemberCardRenderStateInput): MemberCardRenderState {
  return {
    canRemove: canRemoveMember({
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
  currentUserId,
  currentUserRole,
  isOnline,
  isReadOnly,
  member,
}: Omit<MemberCardRenderStateInput, "removingMemberId">) {
  const removalRequirements = [
    !isReadOnly,
    isOnline,
    currentUserRole === "ADMIN",
    currentUserId !== null,
    member.userId !== currentUserId,
  ];

  return removalRequirements.every(Boolean);
}

function isViewerMember(currentUserId: string | null, member: GroupMember) {
  return currentUserId !== null && member.userId === currentUserId;
}
