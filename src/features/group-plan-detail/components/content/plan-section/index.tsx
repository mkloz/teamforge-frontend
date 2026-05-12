import {
  Banknote,
  CalendarClock,
  CircleDot,
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

export function PlanSection({
  detail,
  isHighlighted = false,
  sectionRef,
}: PlanSectionProps) {
  const plan = detail.plan;

  if (!plan) {
    return null;
  }

  const planTime = formatPlanDateTime(plan.dateTime);
  const location = formatLocation(detail);
  const timeUntil = plan.dateTime
    ? getTimeUntilEvent(plan.dateTime)
    : undefined;

  return (
    <Section
      heading="The plan"
      description="What's been decided so far — and what's still open."
      headingId="plan-section-heading"
      sectionRef={sectionRef}
      isHighlighted={isHighlighted}
      trailing={<PlanStatusPill status={plan.status} />}
    >
      <div className="flex flex-col gap-8">
        {plan.description ? (
          <p className="max-w-2xl text-pretty text-foreground text-sm leading-relaxed md:text-base">
            {plan.description}
          </p>
        ) : null}

        <dl className="grid gap-6 sm:grid-cols-2">
          <PlanFact
            icon={CalendarClock}
            label="Date & time"
            value={planTime.full === "Date TBD" ? planTime.date : planTime.full}
            supporting={timeUntil}
          />
          <PlanFact
            icon={plan.locationMode === "ONLINE" ? Wifi : MapPinned}
            label="Location"
            value={location}
            supporting={formatStatusLabel(plan.locationMode)}
          />
          <PlanFact
            icon={Banknote}
            label="Cost"
            value={formatCost(plan)}
            supporting={plan.costDetails ?? undefined}
          />
          <PlanFact
            icon={CircleDot}
            label="Status"
            value={formatStatusLabel(plan.status)}
            supporting={getStatusContext(
              plan.status,
              detail.planning.pendingProposalCount,
            )}
          />
        </dl>
      </div>
    </Section>
  );
}
