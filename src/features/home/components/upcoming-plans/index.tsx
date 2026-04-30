import { buildActivityNavigation } from "@/shared/lib/activity-route";
import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useHomeData } from "../../hooks/use-home-data";
import { PlanCard } from "./plan-card";

function EmptyPlans() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
      <div
        className="size-12 rounded-2xl bg-muted flex items-center justify-center"
        aria-hidden="true"
      >
        <CalendarDays className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-foreground">
          Your calendar is clear
        </p>
        <p className="text-xs text-muted-foreground max-w-55">
          Forge a group or join one to get activities on your calendar.
        </p>
      </div>
    </div>
  );
}

export function UpcomingPlans() {
  const { plans, isLoading } = useHomeData();

  if (isLoading && plans.length === 0) {
    return (
      <div className="w-full flex flex-col gap-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 w-full bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="upcoming-plans-heading"
      className="w-full flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <h2
          id="upcoming-plans-heading"
          className="text-base font-black tracking-tight text-foreground"
        >
          Coming Up
        </h2>
        <Link
          {...buildActivityNavigation()}
          className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          View all
        </Link>
      </div>

      {plans.length === 0 ? (
        <EmptyPlans />
      ) : (
        <div role="list" className="flex flex-col gap-3">
          {plans.map((plan, i) => (
            <PlanCard key={plan.plan.id} group={plan} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
