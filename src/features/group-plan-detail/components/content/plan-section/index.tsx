import type { Ref } from "react";
import { Section } from "@/features/group-plan-detail/components/section";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatCost,
  formatLocation,
  formatPlanDateTime,
  formatStatusLabel,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { getStatusContext, getTimeUntilEvent } from "./plan-section-helpers";
import { PlanStatusPill } from "./plan-status-pill";
import { PlanVisualOverview } from "./plan-visual-overview";

interface PlanSectionProps {
  detail: GroupPlanDetail;
  isHighlighted?: boolean;
  sectionRef?: Ref<HTMLElement>;
}

type Plan = NonNullable<GroupPlanDetail["plan"]>;
type PlanDateTime = ReturnType<typeof formatPlanDateTime>;

interface PlanSectionState {
  cost: string;
  costSupporting?: string;
  dateTime: string;
  dateTimeSupporting?: string;
  location: string;
  locationSupporting: string;
  plan: Plan;
  statusContext?: string;
}

export function PlanSection({
  detail,
  isHighlighted = false,
  sectionRef,
}: PlanSectionProps) {
  const state = getPlanSectionState(detail);

  if (!state) {
    return null;
  }

  return (
    <Section
      eyebrow="Current plan"
      heading="Plan details"
      headingId="plan-section-heading"
      sectionRef={sectionRef}
      isHighlighted={isHighlighted}
      trailing={<PlanStatusPill status={state.plan.status} />}
    >
      <div className="flex flex-col gap-8">
        <PlanDescription
          description={state.plan.description}
          groupDescription={detail.group.description}
        />
        <PlanVisualOverview
          cost={state.cost}
          costSupporting={state.costSupporting}
          dateTime={state.dateTime}
          dateTimeIso={state.plan.dateTime}
          dateTimeSupporting={state.dateTimeSupporting}
          isLocationResolved={state.plan.isLocationResolved}
          isScheduleResolved={state.plan.isScheduleResolved}
          location={state.location}
          locationLat={state.plan.locationLat}
          locationLng={state.plan.locationLng}
          locationMode={state.plan.locationMode}
          locationSupporting={state.locationSupporting}
          statusContext={state.statusContext}
        />
      </div>
    </Section>
  );
}

function getPlanSectionState(detail: GroupPlanDetail): PlanSectionState | null {
  const plan = detail.plan;

  if (!plan) {
    return null;
  }

  const planTime = formatPlanDateTime(plan.dateTime);

  return {
    cost: formatCost(plan),
    costSupporting: plan.costDetails ?? undefined,
    dateTime: getPlanDateTimeValue(plan, planTime),
    dateTimeSupporting: getPlanDateTimeSupporting(plan),
    location: formatLocation(detail),
    locationSupporting: getPlanLocationSupporting(plan),
    plan,
    statusContext: getStatusContext(
      plan.status,
      detail.planning.pendingProposalCount,
    ),
  };
}

function getPlanDateTimeValue(plan: Plan, planTime: PlanDateTime) {
  return plan.isScheduleResolved
    ? planTime.full
    : "Date and time to be decided";
}

function getPlanTimeUntil(plan: Plan) {
  return plan.dateTime ? getTimeUntilEvent(plan.dateTime) : undefined;
}

function getPlanDateTimeSupporting(plan: Plan) {
  if (plan.isScheduleResolved) {
    return getPlanTimeUntil(plan);
  }

  if (plan.nextRequiredAction === "VOTE_TIME") {
    return "A time is ready for your vote";
  }

  return plan.nextRequiredAction === "PROPOSE_TIME"
    ? "Propose a time with the group"
    : "To be decided";
}

function getPlanLocationSupporting(plan: Plan) {
  if (plan.isLocationResolved) {
    return formatStatusLabel(plan.locationMode);
  }

  if (plan.nextRequiredAction === "VOTE_LOCATION") {
    return "A place is ready for your vote";
  }

  return plan.nextRequiredAction === "PROPOSE_LOCATION"
    ? "Choose a place with the group"
    : "To be decided";
}

function PlanDescription({
  description,
  groupDescription,
}: {
  description: string | null;
  groupDescription: string | null;
}) {
  if (
    !description ||
    description.trim().toLocaleLowerCase() ===
      groupDescription?.trim().toLocaleLowerCase()
  ) {
    return null;
  }

  return (
    <p className="max-w-2xl text-pretty text-foreground text-sm leading-relaxed md:text-base">
      {description}
    </p>
  );
}
