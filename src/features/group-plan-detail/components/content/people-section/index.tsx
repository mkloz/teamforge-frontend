import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Section } from "@/features/group-plan-detail/components/section";
import { useGroupInviteSuggestions } from "@/features/group-plan-detail/hooks/use-group-invite-suggestions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { MemberCard } from "./member-card";
import { OpenMemberSlot } from "./open-member-slot";
import {
  AnonymousPendingInvitationSlot,
  PendingInvitationSlot,
} from "./pending-invitation-slot";
import { getPeopleSectionModel } from "./people-section-model";

type PeopleSectionModel = ReturnType<typeof getPeopleSectionModel>;

interface PeopleSectionProps {
  detail: GroupPlanDetail;
}

export function PeopleSection({ detail }: PeopleSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const people = getPeopleSectionModel({ detail, expanded });
  const invitations = useGroupInviteSuggestions(detail);
  const countLabel = getMemberCountLabel(detail);

  return (
    <Section
      heading={people.isViewerMember ? "Members" : "Who you'd be joining"}
      description="See every joined, invited, and available place in this group."
      headingId="people-section-heading"
      trailing={
        <p className="font-bold text-muted-foreground text-sm">{countLabel}</p>
      }
    >
      <PeopleSectionContent
        detail={detail}
        invitations={invitations}
        people={people}
        viewerUserId={detail.viewer.userId}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((value) => !value)}
      />
    </Section>
  );
}

function PeopleSectionContent({
  detail,
  invitations,
  people,
  viewerUserId,
  expanded,
  onToggleExpanded,
}: {
  detail: GroupPlanDetail;
  invitations: ReturnType<typeof useGroupInviteSuggestions>;
  people: PeopleSectionModel;
  viewerUserId: GroupPlanDetail["viewer"]["userId"];
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  return (
    <>
      <PeopleMembersGrid
        detail={detail}
        invitations={invitations}
        people={people}
        viewerUserId={viewerUserId}
      />
      <PeopleSectionToggle
        people={people}
        expanded={expanded}
        onToggleExpanded={onToggleExpanded}
      />
    </>
  );
}

function PeopleMembersGrid({
  detail,
  invitations,
  people,
  viewerUserId,
}: {
  detail: GroupPlanDetail;
  invitations: ReturnType<typeof useGroupInviteSuggestions>;
  people: PeopleSectionModel;
  viewerUserId: GroupPlanDetail["viewer"]["userId"];
}) {
  const pendingCount = detail.group.pendingInvitationsCount;
  const hiddenPendingCount = Math.max(
    0,
    pendingCount - detail.pendingInvitations.length,
  );
  const occupiedCount = detail.group.activeMembersCount + pendingCount;
  const openSlotNumbers = getSlotNumbers(
    occupiedCount + 1,
    detail.group.maxMembers,
  );
  const hiddenPendingSlotNumbers = getSlotNumbers(
    detail.group.activeMembersCount + detail.pendingInvitations.length + 1,
    detail.group.activeMembersCount +
      detail.pendingInvitations.length +
      hiddenPendingCount,
  );

  return (
    <div id="people-members-grid" className="grid gap-1.5 sm:grid-cols-2">
      {people.visibleMembers.map((member) => (
        <MemberCard
          key={member.userId}
          member={member}
          isMember={people.isViewerMember}
          isViewer={member.userId === viewerUserId}
          variant={member.variant}
        />
      ))}
      {detail.pendingInvitations.map((invite) => (
        <PendingInvitationSlot
          key={invite.id}
          canCancel={detail.viewer.canInviteMembers}
          cancelDisabled={invitations.cancellingInviteId !== null}
          cancelling={invitations.cancellingInviteId === invite.id}
          invite={invite}
          onCancel={invitations.onCancelInvitation}
        />
      ))}
      {hiddenPendingSlotNumbers.map((slotNumber) => (
        <AnonymousPendingInvitationSlot
          key={`pending-slot-${slotNumber}`}
          maxMembers={detail.group.maxMembers}
          slotNumber={slotNumber}
        />
      ))}
      {openSlotNumbers.map((slotNumber) => (
        <OpenMemberSlot
          key={`open-slot-${slotNumber}`}
          invitations={invitations}
          maxMembers={detail.group.maxMembers}
          slotNumber={slotNumber}
        />
      ))}
    </div>
  );
}

function PeopleSectionToggle({
  people,
  expanded,
  onToggleExpanded,
}: {
  people: PeopleSectionModel;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  if (!people.hasMoreRegulars) {
    return null;
  }

  return (
    <div className="mt-4">
      <Button
        variant="ghost"
        size="sm"
        aria-controls="people-members-grid"
        aria-expanded={expanded}
        onClick={onToggleExpanded}
      >
        <PeopleSectionToggleIcon expanded={expanded} />
        {getPeopleSectionToggleLabel(people, expanded)}
      </Button>
    </div>
  );
}

function PeopleSectionToggleIcon({ expanded }: { expanded: boolean }) {
  return expanded ? (
    <ChevronUp className="size-4" aria-hidden="true" />
  ) : (
    <ChevronDown className="size-4" aria-hidden="true" />
  );
}

function getPeopleSectionToggleLabel(
  people: PeopleSectionModel,
  expanded: boolean,
) {
  return expanded
    ? "Show fewer members"
    : `Show all ${people.regularCount} more members`;
}

function getMemberCountLabel(detail: GroupPlanDetail) {
  const pendingCount = detail.group.pendingInvitationsCount;
  const openCount = Math.max(
    0,
    detail.group.maxMembers - detail.group.activeMembersCount - pendingCount,
  );
  const parts = [`${detail.group.activeMembersCount} joined`];

  if (pendingCount > 0) {
    parts.push(`${pendingCount} invited`);
  }

  if (openCount > 0) {
    parts.push(`${openCount} open`);
  }

  return parts.join(" · ");
}

function getSlotNumbers(start: number, end: number) {
  if (end < start) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
