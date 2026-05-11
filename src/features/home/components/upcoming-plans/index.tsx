import { Link } from "@tanstack/react-router";
import { EmptyHomePlansVisual } from "@/assets/empty-state/empty-home-plans";
import { buildActivityNavigation } from "@/features/activity/lib/activity-route";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import type { PlannedGroup } from "@/features/home/lib/home-contract";
import { getUpcomingPreview } from "@/features/home/lib/home-insights";
import { Button } from "@/shared/components/ui/button";

import { PlanCard } from "./plan-card";

function EmptyPlans() {
  return (
    <div className="flex items-center gap-3 border-border/70 border-y border-dashed bg-card/40 px-3 py-5">
      <EmptyHomePlansVisual className="w-16 shrink-0 text-foreground sm:w-20" />
      <div className="min-w-0">
        <p className="font-black text-foreground text-sm">
          Your calendar is open.
        </p>
        <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
          Forge a group or join one to get a real plan moving.
        </p>
      </div>
    </div>
  );
}

export function UpcomingPlans() {
  const { plans, isPlansLoading } = useHomeData();

  return <UpcomingPlansView isPlansLoading={isPlansLoading} plans={plans} />;
}

interface UpcomingPlansViewProps {
  isPlansLoading?: boolean;
  plans: PlannedGroup[];
}

export function UpcomingPlansView({
  isPlansLoading = false,
  plans,
}: UpcomingPlansViewProps) {
  const visiblePlans = getUpcomingPreview(plans, 4);
  const hiddenCount = Math.max(0, plans.length - visiblePlans.length);

  if (isPlansLoading && plans.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="upcoming-plans-heading"
      className="flex w-full flex-col gap-4"
    >
      <HomeSectionHeading
        id="upcoming-plans-heading"
        eyebrow="Next up"
        title="Plans on the calendar"
        description="The next few things with a time attached."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link {...buildActivityNavigation()}>View all</Link>
          </Button>
        }
      />

      {visiblePlans.length === 0 ? (
        <EmptyPlans />
      ) : (
        <ul className="relative grid list-none border-border/55 border-y p-0 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-px before:bg-border/45">
          {visiblePlans.map((plan, i) => (
            <PlanCard key={plan.plan.id} group={plan} index={i} />
          ))}
        </ul>
      )}

      {hiddenCount > 0 ? (
        <p className="font-medium text-muted-foreground text-xs">
          {hiddenCount} more plan{hiddenCount === 1 ? "" : "s"} in Activity.
        </p>
      ) : null}
    </section>
  );
}
