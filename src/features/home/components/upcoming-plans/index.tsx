import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeUpcomingPlansSkeleton } from "@/features/home/components/home-skeletons";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import type { PlannedGroup } from "@/features/home/lib/home-contract";
import { getUpcomingPreview } from "@/features/home/lib/home-insights";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { buildActivityNavigation } from "@/shared/navigation/activity-navigation";

import { PlanCard } from "./plan-card";

function EmptyPlans() {
  return (
    <div className="flex min-h-36 items-center justify-center gap-3 rounded-lg border border-border/70 border-dashed px-3 py-5">
      <IconTile icon={CalendarDays} size="xl" shape="circle" tone="neutral" />
      <div className="min-w-0">
        <p className="font-bold text-foreground text-sm">
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
  const { plans, isPlansLoading } = useHomeData({
    include: {
      plans: true,
    },
  });

  return <UpcomingPlansView isPlansLoading={isPlansLoading} plans={plans} />;
}

interface UpcomingPlansViewProps {
  isPlansLoading?: boolean;
  plans: PlannedGroup[];
}

function UpcomingPlansView({
  isPlansLoading = false,
  plans,
}: UpcomingPlansViewProps) {
  const visiblePlans = getUpcomingPreview(plans, 4);

  if (isPlansLoading && plans.length === 0) {
    return <HomeUpcomingPlansSkeleton />;
  }

  return (
    <section
      aria-labelledby="upcoming-plans-heading"
      className="flex w-full flex-col gap-4"
    >
      <HomeSectionHeading
        id="upcoming-plans-heading"
        title="Upcoming plans"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link {...buildActivityNavigation({ filter: "groups" })}>
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      {visiblePlans.length === 0 ? (
        <EmptyPlans />
      ) : (
        <ul className="relative grid list-none border-border/55 border-y p-0 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-px before:bg-border/45">
          {visiblePlans.map((plan) => (
            <PlanCard key={plan.plan.id} plannedGroup={plan} />
          ))}
        </ul>
      )}
    </section>
  );
}
