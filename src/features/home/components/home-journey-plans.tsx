import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  MapPinned,
  Route,
  Ticket,
  Wifi,
} from "lucide-react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeUpcomingPlansSkeleton } from "@/features/home/components/home-skeletons";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import type { PlannedGroup } from "@/features/home/lib/home-contract";
import {
  getPlanTimingLabel,
  getUpcomingPreview,
} from "@/features/home/lib/home-insights";
import {
  getHomePlanCostLabel,
  getHomePlanLocationLabel,
  getHomePlanReadiness,
} from "@/features/home/lib/home-plan-presenters";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";
import { buildActivityNavigation } from "@/shared/navigation/activity-navigation";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation/group-navigation";

export function HomeJourneyPlans() {
  const { plans, isPlansLoading } = useHomeData({
    include: {
      plans: true,
    },
  });
  const visiblePlans = getUpcomingPreview(getChronologicalPlans(plans), 4);

  if (isPlansLoading && plans.length === 0) {
    return <HomeUpcomingPlansSkeleton />;
  }

  return (
    <section
      aria-labelledby="home-journey-plans-heading"
      className="grid min-w-0 gap-5"
    >
      <HomeSectionHeading
        id="home-journey-plans-heading"
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
        <EmptyJourneyPlans />
      ) : (
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.95fr)]">
          <FeaturedJourneyPlan plannedGroup={visiblePlans[0]} />
          {visiblePlans.length > 1 ? (
            <ul className="grouped-surface grid min-w-0 list-none overflow-hidden rounded-2xl p-0">
              {visiblePlans.slice(1).map((plannedGroup) => (
                <CompactJourneyPlan
                  key={plannedGroup.plan.id}
                  plannedGroup={plannedGroup}
                />
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  );
}

function getChronologicalPlans(plans: PlannedGroup[]) {
  const now = Date.now();
  const planSignatures = new Set<string>();

  return plans
    .filter(
      ({ plan }) =>
        plan.status !== "CANCELLED" &&
        plan.status !== "COMPLETED" &&
        getPlanTimestamp(plan) >= now,
    )
    .sort(
      (left, right) =>
        getPlanTimestamp(left.plan) - getPlanTimestamp(right.plan),
    )
    .filter(({ plan }) => {
      const signature = [
        plan.title.trim().toLocaleLowerCase(),
        plan.dateTime ?? "open",
        plan.location?.trim().toLocaleLowerCase() ?? plan.locationMode,
      ].join("|");

      if (planSignatures.has(signature)) {
        return false;
      }

      planSignatures.add(signature);
      return true;
    });
}

function getPlanTimestamp(plan: PlannedGroup["plan"]) {
  if (plan.scheduleMode === "TO_BE_DECIDED" || !plan.dateTime) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = Date.parse(plan.dateTime);

  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function getGroupContext(plannedGroup: PlannedGroup) {
  const groupName = plannedGroup.name.trim();
  const planTitle = plannedGroup.plan.title.trim();

  return groupName.localeCompare(planTitle, undefined, {
    sensitivity: "base",
  }) === 0
    ? null
    : groupName;
}

function FeaturedJourneyPlan({ plannedGroup }: { plannedGroup: PlannedGroup }) {
  const { plan } = plannedGroup;
  const groupContext = getGroupContext(plannedGroup);
  const cornerDate = getCornerDate(plan);
  const readiness = getHomePlanReadiness(plan);

  return (
    <Link
      {...buildGroupPlanDetailNavigation(plannedGroup.id, {
        source: "home",
        plan: plan.id,
      })}
      className="group relative min-h-72 min-w-0 overflow-hidden rounded-2xl bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-full"
    >
      <div className="absolute inset-0">
        <PlanCover
          value={plannedGroup.avatar}
          media={plannedGroup.avatarMedia}
          alt=""
          imageClassName="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          noImageComponent={<JourneyPlanImageFallback />}
        />
      </div>

      <div className="absolute inset-0 bg-background/20" aria-hidden="true" />

      <div className="relative min-h-72 p-4 sm:p-5 lg:min-h-full">
        <PlanCornerDate
          day={cornerDate.day}
          month={cornerDate.month}
          weekday={cornerDate.weekday}
        />

        <div className="absolute inset-x-0 bottom-0 flex min-w-0 flex-col">
          <div className="min-w-0 px-4 pb-3 sm:px-5">
            {readiness ? (
              <PlanReadinessBadge
                inverse
                title={readiness.title}
                tone={readiness.tone}
              />
            ) : null}
            <h3 className="max-w-[85%] text-balance font-black text-2xl text-white leading-[1.05] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] transition-colors group-hover:text-forge-teal sm:text-3xl">
              {plan.title}
            </h3>
            {groupContext ? (
              <p className="mt-1 hidden min-w-0 truncate font-semibold text-white/70 text-xs sm:block">
                {groupContext}
              </p>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-white/20 border-t bg-white/8 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm backdrop-saturate-150 sm:px-5">
            <PlanFact
              icon={CalendarDays}
              inverse
              label={getFooterScheduleLabel(plan)}
            />
            <PlanFact
              icon={plan.locationMode === "ONLINE" ? Wifi : Route}
              inverse
              label={getHomePlanLocationLabel(plan)}
            />
            <PlanFact
              icon={Ticket}
              inverse
              label={getHomePlanCostLabel(plan)}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function PlanCornerDate({
  day,
  month,
  weekday,
}: {
  day: string;
  month: string;
  weekday: string;
}) {
  return (
    <div className="absolute top-4 right-4 flex min-w-12 flex-col items-center text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] sm:top-5 sm:right-5">
      <p className="font-bold text-xs leading-none">{weekday}</p>
      <p className="mt-0.5 font-black text-4xl leading-none tracking-tight">
        {day}
      </p>
      <p className="mt-0.5 font-bold text-sm leading-none">{month}</p>
    </div>
  );
}

function getCornerDate(plan: PlannedGroup["plan"]) {
  if (plan.scheduleMode === "TO_BE_DECIDED" || !plan.dateTime) {
    return {
      day: "—",
      month: "Open",
      weekday: "Date",
    };
  }

  const date = new Date(plan.dateTime);

  if (Number.isNaN(date.getTime())) {
    return {
      day: "—",
      month: "Open",
      weekday: "Date",
    };
  }

  return {
    day: new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(date),
    month: new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
    weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
      date,
    ),
  };
}

function getFooterScheduleLabel(plan: PlannedGroup["plan"]) {
  if (plan.scheduleMode === "TO_BE_DECIDED" || !plan.dateTime) {
    return "Date and time open";
  }

  const date = new Date(plan.dateTime);

  if (Number.isNaN(date.getTime())) {
    return "Date and time open";
  }

  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(date);
  const monthAndDay = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `${weekday} · ${monthAndDay} · ${time}`;
}

function CompactJourneyPlan({ plannedGroup }: { plannedGroup: PlannedGroup }) {
  const { plan } = plannedGroup;
  const groupContext = getGroupContext(plannedGroup);
  const navigation = buildGroupPlanDetailNavigation(plannedGroup.id, {
    source: "home",
    plan: plan.id,
  });
  const LocationIcon = plan.locationMode === "ONLINE" ? Wifi : MapPinned;
  const readiness = getHomePlanReadiness(plan);

  return (
    <li className="group min-w-0 bg-card first:rounded-t-2xl last:rounded-b-2xl">
      <Link
        {...navigation}
        className="relative grid min-h-24 min-w-0 grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 rounded-[inherit] px-3 py-3 pr-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:pr-3"
      >
        <div className="size-16 overflow-hidden rounded-xl bg-card">
          <PlanCover
            value={plannedGroup.avatar}
            media={plannedGroup.avatarMedia}
            alt=""
            imageClassName="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            noImageComponent={<JourneyPlanImageFallback compact />}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate font-bold text-foreground text-sm transition-colors group-hover:text-forge-teal sm:text-base">
            {plan.title}
          </p>
          {groupContext ? (
            <p className="mt-0.5 truncate font-medium text-muted-foreground text-xs">
              {groupContext}
            </p>
          ) : null}
          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <PlanFact icon={Clock} label={getPlanTimingLabel(plan)} />
            <PlanFact
              icon={LocationIcon}
              label={getHomePlanLocationLabel(plan)}
            />
          </div>
          {readiness ? (
            <PlanReadinessBadge title={readiness.title} tone={readiness.tone} />
          ) : null}
        </div>

        <ArrowUpRight
          className="absolute top-3 right-3 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-forge-teal sm:static"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

function PlanReadinessBadge({
  inverse = false,
  title,
  tone,
}: {
  inverse?: boolean;
  title: string;
  tone: "danger" | "neutral" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "mt-2 inline-flex rounded-full px-2 py-0.5 font-bold text-[0.6875rem]",
        inverse && "bg-black/35 text-white backdrop-blur-sm",
        !inverse && tone === "success" && "bg-success/10 text-success",
        !inverse && tone === "warning" && "bg-warning/10 text-warning",
        !inverse && tone === "danger" && "bg-destructive/10 text-destructive",
        !inverse && tone === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {title}
    </span>
  );
}

function PlanFact({
  icon: Icon,
  inverse = false,
  label,
}: {
  icon: typeof Clock;
  inverse?: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1.5 font-medium text-xs",
        inverse ? "text-white/75" : "text-muted-foreground",
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function JourneyPlanImageFallback({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex size-full items-center justify-center bg-card">
      <CalendarDays
        className={cn(
          "text-muted-foreground/60",
          compact ? "size-6" : "size-9",
        )}
        aria-hidden="true"
      />
    </div>
  );
}

function EmptyJourneyPlans() {
  return (
    <div className="flex min-h-36 items-center justify-center gap-3 rounded-lg border border-border/70 border-dashed px-4 py-6">
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
