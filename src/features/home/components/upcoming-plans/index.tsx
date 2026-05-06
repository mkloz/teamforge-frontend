import { buildActivityNavigation } from "@/features/activity/lib/activity-route";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { getUpcomingPreview } from "@/features/home/lib/home-insights";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

import { PlanCard } from "./plan-card";

function EmptyPlans() {
  return (
    <div className="flex items-center gap-3 border-y border-dashed border-border/70 bg-card/40 px-1 py-5 sm:px-3">
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <CalendarDays className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-foreground">
          Your calendar is open.
        </p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
          Forge a group or join one to get a real plan moving.
        </p>
      </div>
    </div>
  );
}

export function UpcomingPlans() {
  const { plans, isPlansLoading } = useHomeData();
  const visiblePlans = getUpcomingPreview(plans, 4);
  const hiddenCount = Math.max(0, plans.length - visiblePlans.length);

  if (isPlansLoading && plans.length === 0) {
    return (
      <div className="flex w-full flex-col gap-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="grid gap-2">
          <div className="h-24 rounded-xl bg-muted" />
          <div className="h-24 rounded-xl bg-muted/60" />
        </div>
      </div>
    );
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
        <div
          role="list"
          className="relative grid border-y border-border/55 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-border/45"
        >
          {visiblePlans.map((plan, i) => (
            <PlanCard key={plan.plan.id} group={plan} index={i} />
          ))}
        </div>
      )}

      {hiddenCount > 0 ? (
        <p className="text-xs font-medium text-muted-foreground">
          {hiddenCount} more plan{hiddenCount === 1 ? "" : "s"} in Activity.
        </p>
      ) : null}
    </section>
  );
}
