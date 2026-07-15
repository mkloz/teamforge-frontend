import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  type LucideIcon,
  MapPinned,
  Wifi,
  XCircle,
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
  location: string;
  locationIcon: LucideIcon;
  locationMode: string;
  plan: Plan;
  statusContext?: string;
  statusIcon: LucideIcon;
  statusLabel: string;
  timeUntil?: string;
}

const PLAN_STATUS_ICONS = {
  CANCELLED: XCircle,
  COMPLETED: CheckCircle2,
  CONFIRMED: CheckCircle2,
  DRAFT: CircleDashed,
  IN_PROGRESS: CircleDot,
  PROPOSED: CircleDashed,
} satisfies Record<Plan["status"], LucideIcon>;

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
      description="See the confirmed details and decisions still open."
      headingId="plan-section-heading"
      sectionRef={sectionRef}
      isHighlighted={isHighlighted}
      trailing={<PlanStatusPill status={state.plan.status} />}
    >
      <div className="flex flex-col gap-8">
        <PlanDescription description={state.plan.description} />
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
    dateTime: getPlanDateTimeValue(planTime),
    location: formatLocation(detail),
    locationIcon: getLocationIcon(plan),
    locationMode: formatStatusLabel(plan.locationMode),
    plan,
    statusContext: getStatusContext(
      plan.status,
      detail.planning.pendingProposalCount,
    ),
    statusIcon: PLAN_STATUS_ICONS[plan.status],
    statusLabel: formatStatusLabel(plan.status),
    timeUntil: getPlanTimeUntil(plan),
  };
}

function getPlanDateTimeValue(planTime: PlanDateTime) {
  return planTime.full === "Date TBD" ? planTime.date : planTime.full;
}

function getPlanTimeUntil(plan: Plan) {
  return plan.dateTime ? getTimeUntilEvent(plan.dateTime) : undefined;
}

function getLocationIcon(plan: Plan) {
  return plan.locationMode === "ONLINE" ? Wifi : MapPinned;
}

function PlanDescription({ description }: { description: string | null }) {
  if (!description) {
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
        supporting={state.timeUntil}
      />
      <PlanFact
        icon={state.locationIcon}
        label="Location"
        value={state.location}
        supporting={state.locationMode}
      />
      <PlanFact
        icon={Banknote}
        label="Cost"
        value={state.cost}
        supporting={state.costSupporting}
      />
      <PlanFact
        icon={state.statusIcon}
        label="Status"
        value={state.statusLabel}
        supporting={state.statusContext}
      />
    </div>
  );
}
