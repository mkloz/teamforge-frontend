import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { HeroCover } from "@/features/group-plan-detail/components/hero/hero-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatCost,
  formatLocation,
  formatPlanDateTime,
  getSeatsLabel,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { Button } from "@/shared/components/ui/button";

interface GroupPlanHeroProps {
  detail: GroupPlanDetail;
}

export function GroupPlanHero({ detail }: GroupPlanHeroProps) {
  const planTitle = detail.plan?.title ?? detail.activity.title;
  const planTime = formatPlanDateTime(detail.plan?.dateTime);
  const location = formatLocation(detail);
  const cost = detail.plan ? formatCost(detail.plan) : null;
  const seats = getSeatsLabel(detail);

  const metadata = [
    planTime.full !== "Date TBD" ? planTime.full : "Date TBD",
    location,
    cost && cost !== "Cost TBD" ? cost : null,
    seats,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="px-0">
        <Link {...buildExploreNavigation()}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to groups
        </Link>
      </Button>

      <HeroCover detail={detail} alt={`${planTitle} cover photo`}>
        <h1 className="mt-4 max-w-3xl text-balance font-black text-3xl text-foreground leading-none tracking-tight md:text-4xl lg:text-5xl">
          {planTitle}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-bold text-foreground/85 text-sm md:text-base">
            {metadata}
          </p>
        </div>

        {detail.group.name !== detail.activity.title ? (
          <p className="mt-2 font-medium text-foreground/70 text-sm">
            {detail.group.name} · gathering around {detail.activity.title}
          </p>
        ) : null}
      </HeroCover>
    </header>
  );
}
