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
    <section aria-label="Group summary">
      <p className="max-w-4xl text-pretty font-semibold text-foreground text-xl leading-snug tracking-tight md:text-2xl">
        {pitch}
      </p>
    </section>
  );
}

function getPitch(detail: GroupPlanDetail, isMember: boolean): string {
  const context = getPitchContext(detail);

  return isMember ? getMemberPitch(context) : getVisitorPitch(context);
}

type PitchContext = {
  activityTitle: string;
  citySuffix: string;
  memberCount: number;
  planStatus: NonNullable<GroupPlanDetail["plan"]>["status"] | null;
  planStatusLabel: string | null;
  seatsLeft: number;
};

function getPitchContext(detail: GroupPlanDetail): PitchContext {
  const memberCount = detail.group.activeMembersCount;

  return {
    activityTitle: detail.activity.title,
    citySuffix: formatCitySuffix(detail.activity.city),
    memberCount,
    planStatus: detail.plan?.status ?? null,
    planStatusLabel: detail.plan
      ? formatStatusLabel(detail.plan.status).toLowerCase()
      : null,
    seatsLeft: Math.max(0, detail.group.maxMembers - memberCount),
  };
}

function getMemberPitch(context: PitchContext) {
  if (context.planStatus === "CONFIRMED") {
    return `The plan is confirmed and ${formatPeopleIn(context.memberCount)} in.`;
  }

  if (context.planStatus === "IN_PROGRESS") {
    return "The plan has started. Continue in the group workspace.";
  }

  return `${formatPeopleIn(context.memberCount)} in. ${getMemberSeatPrompt(context.seatsLeft)}`;
}

function getVisitorPitch(context: PitchContext) {
  if (!context.planStatusLabel) {
    return `A group is forming for ${context.activityTitle}${context.citySuffix}. Join early to help decide the plan.`;
  }

  if (context.seatsLeft === 0) {
    return `${context.memberCount} people are committed to this ${context.planStatusLabel} plan${context.citySuffix}. You can still review the plan and members.`;
  }

  return `${formatPeopleCommitted(context.memberCount)} committed to this ${context.planStatusLabel} plan${context.citySuffix}. ${formatVisitorSeatPrompt(context.seatsLeft)} still open.`;
}

function formatPeopleIn(memberCount: number) {
  return `${memberCount} ${memberCount === 1 ? "person is" : "people are"}`;
}

function formatPeopleCommitted(memberCount: number) {
  return `${memberCount} ${memberCount === 1 ? "person has" : "people have"}`;
}

function getMemberSeatPrompt(seatsLeft: number) {
  return seatsLeft > 0
    ? `${seatsLeft} ${seatsLeft === 1 ? "spot" : "spots"} still open if you want to bring someone.`
    : "The group is full.";
}

function formatVisitorSeatPrompt(seatsLeft: number) {
  return seatsLeft === 1 ? "One spot is" : `${seatsLeft} spots are`;
}

function formatCitySuffix(city: string | null) {
  return city ? ` in ${city}` : "";
}
