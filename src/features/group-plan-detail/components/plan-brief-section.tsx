import { Banknote, CalendarClock, MapPinned, NotebookText } from "lucide-react";
import type { ReactNode, Ref } from "react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatCost,
  formatLocation,
  formatPlanDateTime,
  formatStatusLabel,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { cn } from "@/shared/lib/utils";

interface PlanBriefSectionProps {
  detail: GroupPlanDetail;
  isHighlighted?: boolean;
  sectionRef?: Ref<HTMLElement>;
}

export function PlanBriefSection({
  detail,
  isHighlighted = false,
  sectionRef,
}: PlanBriefSectionProps) {
  const planTime = formatPlanDateTime(detail.plan?.dateTime);
  const location = formatLocation(detail);
  const plan = detail.plan;

  return (
    <section
      aria-labelledby="plan-brief-heading"
      ref={sectionRef}
      className={cn(
        "scroll-mt-24 border-border/70 border-b pb-8 transition-colors duration-500",
        isHighlighted &&
          "rounded-2xl bg-forge-teal/5 ring-2 ring-forge-teal/25 ring-offset-4 ring-offset-background",
      )}
    >
      <div>
        <div>
          <p className="font-black text-forge-teal text-xs uppercase tracking-widest">
            The plan
          </p>
          <h2
            id="plan-brief-heading"
            className="mt-2 font-black text-2xl text-foreground tracking-tight"
          >
            Plan at a glance
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <BriefItem
          icon={<CalendarClock className="size-5" aria-hidden="true" />}
          label="Date"
          value={planTime.date}
          supporting={planTime.time}
        />
        <BriefItem
          icon={<MapPinned className="size-5" aria-hidden="true" />}
          label="Location"
          value={location}
          supporting={
            plan?.locationMode ? formatStatusLabel(plan.locationMode) : "TBD"
          }
        />
        <BriefItem
          icon={<Banknote className="size-5" aria-hidden="true" />}
          label="Cost"
          value={formatCost(plan)}
          supporting={plan?.costDetails ?? "Clear before you commit"}
        />
        <BriefItem
          icon={<NotebookText className="size-5" aria-hidden="true" />}
          label="Category"
          value={plan ? formatStatusLabel(plan.category) : "TBD"}
          supporting={detail.activity.city ?? "Flexible"}
        />
      </div>

      {plan?.description ? (
        <p className="mt-6 max-w-3xl text-foreground text-sm leading-relaxed">
          {plan.description}
        </p>
      ) : (
        <p className="mt-6 max-w-3xl text-muted-foreground text-sm leading-relaxed">
          The group has the outline in place. Final details can still be shaped
          together once everyone is in.
        </p>
      )}
    </section>
  );
}

function BriefItem({
  icon,
  label,
  supporting,
  value,
}: {
  icon: ReactNode;
  label: string;
  supporting: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-forge-teal">
        {icon}
        <p className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="wrap-break-word mt-3 line-clamp-2 font-black text-foreground text-lg leading-snug">
        {value}
      </p>
      <p className="wrap-break-word mt-1 line-clamp-2 font-medium text-muted-foreground text-sm leading-relaxed">
        {supporting}
      </p>
    </div>
  );
}
