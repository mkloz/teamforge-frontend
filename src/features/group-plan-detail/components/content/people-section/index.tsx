import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Section } from "@/features/group-plan-detail/components/section";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { MemberCard } from "./member-card";
import {
  COMPACT_MEMBER_LIMIT,
  getPeopleSectionModel,
} from "./people-section-model";

interface PeopleSectionProps {
  detail: GroupPlanDetail;
}

export function PeopleSection({ detail }: PeopleSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const people = getPeopleSectionModel({ detail, expanded });

  return (
    <Section
      heading="Who you'd be joining"
      description="A quick read on the humans behind this plan."
      headingId="people-section-heading"
      trailing={
        <p className="font-bold text-muted-foreground text-sm">
          {detail.group.activeMembersCount}/{detail.group.maxMembers} in
        </p>
      }
    >
      {people.visibleMembers.length > 0 ? (
        <>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {people.visibleMembers.map((member) => (
              <MemberCard
                key={member.userId}
                member={member}
                isMember={people.isViewerMember}
                isViewer={member.userId === detail.viewer.userId}
                variant={member.variant}
              />
            ))}
          </div>
          {people.hasMoreRegulars ? (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? (
                  <ChevronUp className="size-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="size-4" aria-hidden="true" />
                )}
                {expanded
                  ? "Show fewer members"
                  : `Show all ${people.regularCount} more members`}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex min-h-32 items-center justify-center py-4 text-center">
          <p className="text-muted-foreground text-sm">
            No one is in yet. Be the first to join.
          </p>
        </div>
      )}
    </Section>
  );
}

export { COMPACT_MEMBER_LIMIT };
