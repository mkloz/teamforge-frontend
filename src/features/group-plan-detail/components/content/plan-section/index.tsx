import {
  Banknote,
  CalendarClock,
  type LucideIcon,
  MapPinned,
  Wifi,
} from "lucide-react";
import type { Ref } from "react";
import { Section } from "@/features/group-plan-detail/components/section";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatCost,
  formatLocation,
  formatPlanDateTime,
  formatStatusLabel,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { PlanFact } from "./plan-fact";
import { getStatusContext, getTimeUntilEvent } from "./plan-section-helpers";
import { PlanStatusPill } from "./plan-status-pill";

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
  locationIcon: LucideIcon;
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
      heading="The plan"
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
        {state.statusContext ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {state.statusContext}
          </p>
        ) : null}
        <PlanFactsGrid state={state} />
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
    locationIcon: getLocationIcon(plan),
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

function getLocationIcon(plan: Plan) {
  return plan.locationMode === "ONLINE" ? Wifi : MapPinned;
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

function PlanFactsGrid({ state }: { state: PlanSectionState }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <PlanFact
        icon={CalendarClock}
        label="Date & time"
        value={state.dateTime}
        supporting={state.dateTimeSupporting}
      />
      <PlanFact
        icon={state.locationIcon}
        label="Location"
        value={state.location}
        supporting={state.locationSupporting}
      />
      <PlanFact
        icon={Banknote}
        label="Cost"
        value={state.cost}
        supporting={state.costSupporting}
      />
    </div>
  );
}
