import { useGroupPlanActionState } from "@/features/group-plan-detail/hooks/use-group-plan-action-state";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { formatStatusLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";

interface PitchSectionProps {
  detail: GroupPlanDetail;
}

export function PitchSection({ detail }: PitchSectionProps) {
  const action = useGroupPlanActionState(detail);
  const pitch = getPitch(detail, action.isMember);

  return (
    <section aria-label="The Pitch">
      <p className="max-w-4xl text-pretty font-semibold text-foreground text-xl leading-snug tracking-tight md:text-2xl">
        {pitch}
      </p>
    </section>
  );
}

function getPitch(detail: GroupPlanDetail, isMember: boolean): string {
  const memberCount = detail.group.activeMembersCount;
  const seatsLeft = Math.max(0, detail.group.maxMembers - memberCount);
  const city = detail.activity.city;

  if (isMember) {
    if (detail.plan?.status === "CONFIRMED") {
      return `The plan is confirmed and ${memberCount} ${memberCount === 1 ? "person is" : "people are"} in.`;
    }
    if (detail.plan?.status === "IN_PROGRESS") {
      return "The plan is underway, keep the group moving in the workspace.";
    }
    return `${memberCount} ${memberCount === 1 ? "person is" : "people are"} in. ${seatsLeft > 0 ? `${seatsLeft} ${seatsLeft === 1 ? "spot" : "spots"} still open if you want to bring someone.` : "The group is full."}`;
  }

  if (!detail.plan) {
    return `A group is forming around ${detail.activity.title}${city ? ` in ${city}` : ""}. Join early to help shape the plan.`;
  }

  if (seatsLeft === 0) {
    return `${memberCount} people are committed to this ${formatStatusLabel(detail.plan.status).toLowerCase()} plan${city ? ` in ${city}` : ""}. You can still see whether the group feels right.`;
  }

  return `${memberCount} ${memberCount === 1 ? "person has" : "people have"} committed to this ${formatStatusLabel(detail.plan.status).toLowerCase()} plan${city ? ` in ${city}` : ""}. ${seatsLeft === 1 ? "One spot is" : `${seatsLeft} spots are`} still open.`;
}
