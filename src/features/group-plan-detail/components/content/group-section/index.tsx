import { Globe, Lock, UsersRound } from "lucide-react";
import { Section } from "@/features/group-plan-detail/components/section";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getSeatsLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { GroupFact } from "./group-fact";
import { GroupIdentity } from "./group-identity";
import { formatGroupVisibility } from "./group-section-model";

interface GroupSectionProps {
  detail: GroupPlanDetail;
}

export function GroupSection({ detail }: GroupSectionProps) {
  const seats = getSeatsLabel(detail);
  const accessLabel =
    detail.group.access === "OPEN" ? "Open to join" : "By request";
  const visibilityLabel = formatGroupVisibility(detail.group.visibility);

  return (
    <Section
      heading="About this group"
      description="See the group's purpose, size, and joining options."
      headingId="group-section-heading"
    >
      <div className="flex flex-col gap-8">
        <GroupIdentity detail={detail} />

        <div className="grid gap-6 sm:grid-cols-2">
          <GroupFact
            icon={UsersRound}
            label="Spots"
            value={`${detail.group.activeMembersCount}/${detail.group.maxMembers} members`}
            supporting={seats}
          />
          <GroupFact
            icon={detail.group.access === "OPEN" ? Globe : Lock}
            label="Access"
            value={accessLabel}
            supporting={visibilityLabel}
          />
        </div>
      </div>
    </Section>
  );
}
