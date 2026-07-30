import {
  Clock3,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  ActivityParticipant,
  GroupMember,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import type { Invite } from "@/shared/schemas";

import { InviteMembersDialog } from "./invite-members-dialog";
import { MemberCard } from "./member-card";
import { formatMemberPercent } from "./member-card-view-state";

interface MembersSectionProps {
  canInviteMembers?: boolean;
  canRemoveMembers?: boolean;
  cancellingInviteId?: string | null;
  inviteCandidates?: ActivityParticipant[];
  invitingMemberId?: string | null;
  isOnline?: boolean;
  isReadOnly?: boolean;
  members: GroupMember[];
  maxMembers: number;
  pendingInvitations?: Invite[];
  currentUserId: string | null;
  currentUserRole: MemberRole;
  onInviteMember?: (memberId: string) => Promise<void> | void;
  onCancelInvitation?: (inviteId: string) => Promise<void> | void;
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
  pendingInvitations: Invite[];
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
  canCancelInvitations: boolean;
  canRemoveMembers?: boolean;
  cancellingInviteId: string | null;
  currentUserId: string | null;
  currentUserRole: MemberRole;
  isOnline: boolean;
  isReadOnly: boolean;
  inviteCandidates: ActivityParticipant[];
  invitingMemberId: string | null;
  maxMembers: number;
  members: GroupMember[];
  onRemoveMember?: MembersSectionProps["onRemoveMember"];
  onShowProfile?: MembersSectionProps["onShowProfile"];
  onInviteMember?: MembersSectionProps["onInviteMember"];
  onCancelInvitation?: MembersSectionProps["onCancelInvitation"];
  pendingInvitations: Invite[];
  removingMemberId: string | null;
  showInviteAction: boolean;
  showMemberFit: boolean;
}

const EMPTY_INVITE_CANDIDATES: ActivityParticipant[] = [];
const EMPTY_PENDING_INVITATIONS: Invite[] = [];

export function MembersSection({
  canInviteMembers,
  canRemoveMembers,
  cancellingInviteId = null,
  inviteCandidates = EMPTY_INVITE_CANDIDATES,
  invitingMemberId = null,
  isOnline = true,
  isReadOnly = false,
  members,
  maxMembers,
  pendingInvitations = EMPTY_PENDING_INVITATIONS,
  currentUserId,
  currentUserRole,
  onInviteMember,
  onCancelInvitation,
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
    pendingInvitations,
    isOnline,
  });

  return (
    <section aria-labelledby="members-heading">
      <MembersSectionHeader
        memberCountString={viewState.memberCountString}
        showOfflineMemberActionWarning={
          viewState.showOfflineMemberActionWarning
        }
      />

      <MembersGrid
        canCancelInvitations={
          (canInviteMembers ?? currentUserRole !== "MEMBER") &&
          !isReadOnly &&
          isOnline &&
          onCancelInvitation !== undefined
        }
        cancellingInviteId={cancellingInviteId}
        currentUserId={currentUserId}
        canRemoveMembers={canRemoveMembers}
        currentUserRole={currentUserRole}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        inviteCandidates={inviteCandidates}
        invitingMemberId={invitingMemberId}
        maxMembers={maxMembers}
        members={members}
        pendingInvitations={pendingInvitations}
        onInviteMember={onInviteMember}
        onCancelInvitation={onCancelInvitation}
        onRemoveMember={onRemoveMember}
        onShowProfile={onShowProfile}
        removingMemberId={removingMemberId}
        showInviteAction={viewState.canInvite}
        showMemberFit={members.length > 1}
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
  pendingInvitations,
}: MembersSectionViewStateInput): MembersSectionViewState {
  const openSlotCount = Math.max(
    0,
    maxMembers - members.length - pendingInvitations.length,
  );

  return {
    canInvite: canInviteMembersForViewer({
      canInviteMembers: canInviteMembersCapability,
      currentUserRole,
      inviteCandidates,
      isReadOnly,
      maxMembers,
      members,
      onInviteMember,
      pendingInvitations,
    }),
    memberCountString: getMemberCountString({
      memberCount: members.length,
      pendingCount: pendingInvitations.length,
      openSlotCount,
    }),
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
  pendingInvitations,
}: Omit<MembersSectionViewStateInput, "isOnline">) {
  const inviteRequirements = [
    canInviteMembers ?? currentUserRole !== "MEMBER",
    !isReadOnly,
    members.length + pendingInvitations.length < maxMembers,
    inviteCandidates.length > 0,
    onInviteMember !== undefined,
  ];

  return inviteRequirements.every(Boolean);
}

function getMemberCountString({
  memberCount,
  openSlotCount,
  pendingCount,
}: {
  memberCount: number;
  openSlotCount: number;
  pendingCount: number;
}) {
  const parts = [`${memberCount} joined`];

  if (pendingCount > 0) {
    parts.push(`${pendingCount} invited`);
  }

  if (openSlotCount > 0) {
    parts.push(`${openSlotCount} open`);
  }

  return parts.join(" · ");
}

function shouldShowOfflineMemberActionWarning({
  currentUserRole,
  isOnline,
}: Pick<MembersSectionViewStateInput, "currentUserRole" | "isOnline">) {
  return !isOnline && currentUserRole !== "MEMBER";
}

function MembersSectionHeader({
  memberCountString,
  showOfflineMemberActionWarning,
}: {
  memberCountString: string;
  showOfflineMemberActionWarning: boolean;
}) {
  return (
    <div className="mb-3">
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
    </div>
  );
}

function MembersGrid({
  canCancelInvitations,
  canRemoveMembers,
  cancellingInviteId,
  currentUserId,
  currentUserRole,
  inviteCandidates,
  invitingMemberId,
  isOnline,
  isReadOnly,
  maxMembers,
  members,
  onInviteMember,
  onCancelInvitation,
  onRemoveMember,
  onShowProfile,
  pendingInvitations,
  removingMemberId,
  showInviteAction,
  showMemberFit,
}: MembersGridProps) {
  const occupiedSlotCount = members.length + pendingInvitations.length;
  const openSlots = getOpenMemberSlots(occupiedSlotCount, maxMembers);

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
            showFit={showMemberFit}
          />
        );
      })}

      {pendingInvitations.map((invite) => (
        <PendingInvitationSlot
          canCancel={canCancelInvitations}
          cancelDisabled={cancellingInviteId !== null}
          cancelling={cancellingInviteId === invite.id}
          invite={invite}
          key={invite.id}
          onCancel={onCancelInvitation}
        />
      ))}

      {openSlots.map((slot) => (
        <OpenMemberSlot
          key={slot.id}
          canInvite={showInviteAction}
          candidates={inviteCandidates}
          disabled={!isOnline}
          invitingMemberId={invitingMemberId}
          maxMembers={maxMembers}
          onInvite={onInviteMember}
          slotNumber={slot.number}
        />
      ))}
    </div>
  );
}

function getOpenMemberSlots(occupiedSlotCount: number, maxMembers: number) {
  const slots: Array<{ id: string; number: number }> = [];

  for (
    let slotNumber = occupiedSlotCount + 1;
    slotNumber <= maxMembers;
    slotNumber += 1
  ) {
    slots.push({
      id: `open-member-slot-${slotNumber}`,
      number: slotNumber,
    });
  }

  return slots;
}

function PendingInvitationSlot({
  canCancel,
  cancelDisabled,
  cancelling,
  invite,
  onCancel,
}: {
  canCancel: boolean;
  cancelDisabled: boolean;
  cancelling: boolean;
  invite: Invite;
  onCancel?: MembersSectionProps["onCancelInvitation"];
}) {
  const trustPercent = formatMemberPercent(invite.invitee.trustScore);
  const elapsed = usePendingInviteElapsedTime(invite.createdAt);

  return (
    <article className="group/pending flex min-h-16 items-center gap-3 rounded-xl border border-border/35 border-dashed bg-card/35 px-2 py-2 text-muted-foreground">
      <Avatar
        src={invite.invitee.avatar}
        name={invite.invitee.name}
        className="size-11 opacity-55 grayscale"
        imageClassName="opacity-75"
        fallbackClassName="bg-muted text-muted-foreground"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground/60 text-sm">
          {invite.invitee.name}
        </p>
        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-muted-foreground/65 text-xs leading-tight">
          {invite.invitee.personalityType ? (
            <span className="shrink-0 font-semibold">
              {invite.invitee.personalityType}
            </span>
          ) : null}
          {trustPercent !== null ? (
            <>
              {invite.invitee.personalityType ? (
                <span
                  className="size-1 shrink-0 rounded-full bg-muted-foreground/30"
                  aria-hidden="true"
                />
              ) : null}
              <ShieldCheck className="size-3" aria-hidden="true" />
              <span className="sr-only">Trust</span>
              <span>{trustPercent}%</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="relative flex shrink-0 items-center justify-end gap-1.5">
        <span className="flex items-center gap-1 text-muted-foreground/65 text-xs transition-opacity sm:group-hover/pending:opacity-0 sm:group-focus-within/pending:opacity-0">
          <Clock3 className="size-3.5" aria-hidden="true" />
          <time dateTime={invite.createdAt}>{elapsed}</time>
        </span>
        {canCancel && onCancel ? (
          <button
            type="button"
            aria-label={`Cancel invitation for ${invite.invitee.name}`}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,opacity,transform] hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/35 disabled:pointer-events-none sm:absolute sm:right-0 sm:translate-x-1 sm:opacity-0 sm:group-hover/pending:translate-x-0 sm:group-hover/pending:opacity-100 sm:group-focus-within/pending:translate-x-0 sm:group-focus-within/pending:opacity-100"
            disabled={cancelDisabled}
            onClick={() => onCancel(invite.id)}
            title={`Cancel invitation for ${invite.invitee.name}`}
          >
            {cancelling ? (
              <LoaderCircle
                className="size-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Trash2 className="size-3.5" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function usePendingInviteElapsedTime(createdAt: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return formatPendingInviteElapsedTime(createdAt, now);
}

function formatPendingInviteElapsedTime(createdAt: string, now: number) {
  const createdAtTime = Date.parse(createdAt);

  if (Number.isNaN(createdAtTime)) {
    return "Pending";
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - createdAtTime) / 60_000),
  );

  if (elapsedMinutes < 1) {
    return "Now";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 48) {
    return `${elapsedHours}h`;
  }

  return `${Math.floor(elapsedHours / 24)}d`;
}

function OpenMemberSlot({
  canInvite,
  candidates,
  disabled,
  invitingMemberId,
  maxMembers,
  onInvite,
  slotNumber,
}: {
  canInvite: boolean;
  candidates: ActivityParticipant[];
  disabled: boolean;
  invitingMemberId: string | null;
  maxMembers: number;
  onInvite: MembersSectionProps["onInviteMember"];
  slotNumber: number;
}) {
  const isInteractive = canInvite && onInvite !== undefined;
  const slot = (
    <button
      type="button"
      aria-label={
        isInteractive
          ? `Invite someone to member slot ${slotNumber} of ${maxMembers}`
          : `Open member slot ${slotNumber} of ${maxMembers}`
      }
      className={cn(
        "group/slot flex min-h-16 w-full items-center gap-3 rounded-xl border border-border/45 border-dashed px-2 py-2 text-left text-muted-foreground transition-[background-color,border-color,color] duration-150",
        isInteractive &&
          "hover:border-forge-teal/45 hover:bg-forge-teal/5 hover:text-forge-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30",
        !isInteractive && "cursor-default opacity-65",
      )}
      disabled={!isInteractive || disabled}
      title={
        disabled && isInteractive
          ? "Reconnect before inviting members."
          : undefined
      }
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border/55 border-dashed bg-muted/25 transition-colors group-hover/slot:border-forge-teal/35 group-hover/slot:bg-forge-teal/8">
        {isInteractive ? (
          <UserPlus className="size-4.5" aria-hidden="true" />
        ) : (
          <Plus className="size-4.5" aria-hidden="true" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-sm">
          {isInteractive ? "Invite someone" : "Open member slot"}
        </span>
        <span className="mt-0.5 block text-muted-foreground/70 text-xs">
          Slot {slotNumber} of {maxMembers}
        </span>
      </span>
    </button>
  );

  if (!isInteractive) {
    return slot;
  }

  return (
    <InviteMembersDialog
      candidates={candidates}
      disabled={disabled}
      invitingMemberId={invitingMemberId}
      onInvite={(memberId) => onInvite?.(memberId)}
      trigger={slot}
    />
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
