import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Section } from "@/features/group-plan-detail/components/section";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { MemberCard } from "./member-card";
import { getPeopleSectionModel } from "./people-section-model";

type PeopleSectionModel = ReturnType<typeof getPeopleSectionModel>;

interface PeopleSectionProps {
  detail: GroupPlanDetail;
}

export function PeopleSection({ detail }: PeopleSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const people = getPeopleSectionModel({ detail, expanded });

  return (
    <Section
      heading="Who you'd be joining"
      headingId="people-section-heading"
      trailing={
        <p className="font-bold text-muted-foreground text-sm">
          {detail.group.activeMembersCount}/{detail.group.maxMembers} in
        </p>
      }
    >
      <PeopleSectionContent
        people={people}
        viewerUserId={detail.viewer.userId}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((value) => !value)}
      />
    </Section>
  );
}

function PeopleSectionContent({
  people,
  viewerUserId,
  expanded,
  onToggleExpanded,
}: {
  people: PeopleSectionModel;
  viewerUserId: GroupPlanDetail["viewer"]["userId"];
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  if (!hasVisibleMembers(people)) {
    return <PeopleSectionEmptyState />;
  }

  return (
    <>
      <PeopleMembersGrid people={people} viewerUserId={viewerUserId} />
      <PeopleSectionToggle
        people={people}
        expanded={expanded}
        onToggleExpanded={onToggleExpanded}
      />
    </>
  );
}

function PeopleMembersGrid({
  people,
  viewerUserId,
}: {
  people: PeopleSectionModel;
  viewerUserId: GroupPlanDetail["viewer"]["userId"];
}) {
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

function PeopleSectionEmptyState() {
  return (
    <div className="flex min-h-32 items-center justify-center py-4 text-center">
      <p className="text-muted-foreground text-sm">
        No one is in yet. Be the first to join.
      </p>
    </div>
  );
}

function hasVisibleMembers(people: PeopleSectionModel) {
  return people.visibleMembers.length > 0;
}

function getPeopleSectionToggleLabel(
  people: PeopleSectionModel,
  expanded: boolean,
) {
  return expanded
    ? "Show fewer members"
    : `Show all ${people.regularCount} more members`;
}
