import { scenarioRuntime } from "virtual:scenario-runtime";
import {
  Accessibility,
  Banknote,
  CalendarClock,
  Globe2,
  LockKeyhole,
  MapPin,
  MonitorUp,
  UsersRound,
  Wifi,
} from "lucide-react";
import type { Ref } from "react";
import { config } from "@/config/config";
import {
  formatGroupVisibility,
  resolveGroupImage,
} from "@/features/group-plan-detail/components/content/group-section/group-section-model";
import { getCategoryCover } from "@/features/group-plan-detail/lib/category-cover";
import { isGroupPlanMemberRelationship } from "@/features/group-plan-detail/lib/group-plan-access";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatCost,
  formatLocation,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { Avatar } from "@/shared/components/common/avatar";
import { Image } from "@/shared/components/common/image";
import { cn } from "@/shared/lib/utils";
import { isSystemManagedGroupGovernance } from "@/shared/schemas/group-governance";
import { PlanCalendarActions } from "./plan-calendar-actions";

interface GroupPlanOverviewSectionProps {
  detail: GroupPlanDetail;
  isHighlighted?: boolean;
  sectionRef?: Ref<HTMLElement>;
}

type Plan = NonNullable<GroupPlanDetail["plan"]>;

interface CalendarParts {
  day: string;
  month: string;
  time: string;
  weekday: string;
}

export function GroupPlanOverviewSection({
  detail,
  isHighlighted = false,
  sectionRef,
}: GroupPlanOverviewSectionProps) {
  const plan = detail.plan;
  const governance = detail.governance;
  const isReadOnly =
    governance === undefined ||
    (isSystemManagedGroupGovernance(governance) && !governance.chat.writable);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="group-section-heading plan-section-heading"
      className={cn(
        "grouped-surface flex scroll-mt-24 flex-col overflow-hidden rounded-2xl transition-colors duration-500",
        isHighlighted &&
          "ring-2 ring-brand-teal/30 ring-offset-4 ring-offset-background",
      )}
    >
      <div className="grouped-surface grid lg:grid-cols-[minmax(0,1.08fr)_minmax(12rem,0.72fr)_minmax(16rem,1fr)]">
        <GroupStory detail={detail} />
        <PlanCalendar detail={detail} plan={plan} />
        <PlanPlace detail={detail} plan={plan} />
      </div>

      {plan ? <PlanNote detail={detail} plan={plan} /> : null}
      <OverviewFooter detail={detail} plan={plan} />
      {plan?.accessFacts.length ? <PlanAccessFacts plan={plan} /> : null}

      {isReadOnly ? (
        <p className="rounded-xl bg-card px-5 py-3 text-muted-foreground text-xs leading-relaxed sm:px-6 lg:px-7">
          This group is read-only right now. You can still review the plan,
          report a concern, or leave if that option is available.
        </p>
      ) : null}
    </section>
  );
}

function PlanAccessFacts({ plan }: { plan: Plan }) {
  return (
    <section
      aria-labelledby="plan-access-facts-heading"
      className="rounded-xl bg-card px-5 py-4 sm:px-6 lg:px-7"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-foreground">
          <Accessibility className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="font-extrabold text-foreground text-sm"
            id="plan-access-facts-heading"
          >
            Access facts
          </h3>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Individual facts, not an overall accessibility rating. Check the
            source and date before relying on them.
          </p>
        </div>
      </div>
      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {plan.accessFacts.map((fact) => (
          <div
            className="rounded-lg border border-border/60 px-3 py-2.5"
            key={fact.factKey}
          >
            <dt className="font-bold text-foreground text-xs">
              {formatAccessFactLabel(fact.factKey)}
            </dt>
            <dd className="mt-1 text-sm">
              <span className="font-extrabold">
                {formatAccessFactValue(fact.value)}
              </span>
              <span className="text-muted-foreground">
                {` · ${fact.source} · checked ${formatAccessCheckedDate(
                  fact.checkedAt,
                )}`}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatAccessFactLabel(factKey: string) {
  return factKey
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function formatAccessFactValue(value: Plan["accessFacts"][number]["value"]) {
  if (value === "YES") return "Yes";
  if (value === "NO") return "No";
  return "Unknown";
}

function formatAccessCheckedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function GroupStory({ detail }: { detail: GroupPlanDetail }) {
  const category = getCategoryCover(detail.plan?.category);
  const CategoryIcon = category.icon;
  const groupImage = resolveGroupImage(detail);
  const description =
    detail.group.description ??
    `A group forming around ${detail.activity.title}${
      detail.activity.city ? ` in ${detail.activity.city}` : ""
    }.`;

  return (
    <div className="rounded-xl bg-card p-5 sm:p-6 lg:min-h-64 lg:p-7">
      <div className="flex items-center gap-4">
        <Avatar
          src={groupImage}
          name={detail.group.name}
          alt={`${detail.group.name} group`}
          imageSize={160}
          shape="rounded"
          className="size-14 shrink-0 rounded-xl sm:size-16"
          fallback={
            <CategoryIcon
              className="size-6 text-foreground/50 sm:size-7"
              aria-hidden="true"
            />
          }
          fallbackClassName="bg-primary-soft"
        />
        <div className="min-w-0">
          <h2
            id="group-section-heading"
            className="text-balance font-extrabold text-2xl text-foreground leading-tight tracking-tight md:text-3xl"
          >
            {detail.group.name}
          </h2>
        </div>
      </div>

      <div className="mt-7">
        <p className="max-w-md text-pretty text-foreground/90 text-sm leading-relaxed sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

function PlanCalendar({
  detail,
  plan,
}: {
  detail: GroupPlanDetail;
  plan: Plan | null;
}) {
  if (!plan) {
    return <PlanCalendarEmpty />;
  }

  const calendar = getCalendarParts(plan.dateTime);

  return (
    <div className="rounded-xl bg-card p-5 sm:p-6 lg:min-h-64 lg:p-7">
      <h2 id="plan-section-heading" className="sr-only">
        Plan details
      </h2>

      {plan.isScheduleResolved && calendar ? (
        <div>
          <p className="font-bold text-muted-foreground text-sm">
            {calendar.weekday}
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-black text-6xl text-foreground leading-none tracking-[-0.06em]">
              {calendar.day}
            </span>
            <span className="pb-1 font-black text-3xl text-foreground leading-none">
              {calendar.month}
            </span>
          </div>
          <div className="mt-5 flex items-center gap-2 border-divider border-t pt-4 text-foreground">
            <CalendarClock className="size-4" aria-hidden="true" />
            <span className="font-bold text-lg">{calendar.time}</span>
          </div>
          {isCalendarExportAvailable(detail, plan) ? (
            <PlanCalendarActions planId={plan.id} />
          ) : null}
        </div>
      ) : (
        <div className="mt-8">
          <CalendarClock
            className="size-8 text-foreground"
            aria-hidden="true"
          />
          <p className="mt-4 font-extrabold text-foreground text-xl">
            Decide together
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            The date and time are still open.
          </p>
        </div>
      )}
    </div>
  );
}

function isCalendarExportAvailable(detail: GroupPlanDetail, plan: Plan) {
  return (
    isGroupPlanMemberRelationship(detail.viewer.relationship) &&
    Boolean(plan.dateTime && (plan.endAt || plan.durationMinutes))
  );
}

function PlanCalendarEmpty() {
  return (
    <div className="rounded-xl bg-card p-5 sm:p-6 lg:min-h-64 lg:p-7">
      <h2 id="plan-section-heading" className="sr-only">
        Plan details
      </h2>
      <CalendarClock
        className="size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <p className="mt-4 font-extrabold text-foreground text-xl">No plan yet</p>
      <p className="mt-2 text-muted-foreground text-sm">
        This group has not set its first plan.
      </p>
    </div>
  );
}

function PlanPlace({
  detail,
  plan,
}: {
  detail: GroupPlanDetail;
  plan: Plan | null;
}) {
  if (!plan) {
    return <LocationEmpty />;
  }

  if (plan.locationMode === "ONLINE") {
    return <OnlinePlanPlace plan={plan} />;
  }

  const location = formatLocation(detail);
  if (
    !plan.isLocationResolved ||
    plan.locationLat === null ||
    plan.locationLng === null ||
    !isGroupPlanMemberRelationship(detail.viewer.relationship)
  ) {
    return (
      <AreaPlanPlace isResolved={plan.isLocationResolved} location={location} />
    );
  }

  const mapImageUrl = getGoogleStaticMapUrl(plan.locationLat, plan.locationLng);
  const mapUrl = getGoogleMapsUrl(plan.locationLat, plan.locationLng);

  if (!mapImageUrl) {
    return (
      <AreaPlanPlace isResolved={plan.isLocationResolved} location={location} />
    );
  }

  return (
    <div className="flex min-h-64 flex-col overflow-hidden rounded-xl bg-(--grouped-menu-selected)">
      <a
        href={mapUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${location} in Google Maps`}
        className="group/map relative min-h-44 flex-1 overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-inset"
      >
        <Image
          src={mapImageUrl}
          alt=""
          showLoadingState={false}
          wrapperClassName="absolute inset-0"
          className="size-full object-cover transition-transform duration-300 group-hover/map:scale-[1.015]"
          fallbackComponent={
            <div className="size-full bg-[radial-gradient(circle_at_65%_38%,color-mix(in_srgb,var(--brand-teal)_18%,transparent),transparent_30%)]" />
          }
        />
      </a>
      <div className="mt-2 flex items-start gap-3 bg-card/35 px-5 py-4 sm:px-6">
        <MapPin
          className="mt-0.5 size-5 shrink-0 text-foreground"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="font-bold text-muted-foreground text-xs">
            Where to meet
          </p>
          <p className="mt-1 font-extrabold text-foreground text-lg leading-tight">
            {location}
          </p>
          <p className="mt-1 font-medium text-muted-foreground text-xs">
            In person · opens in Google Maps
          </p>
        </div>
      </div>
    </div>
  );
}

function AreaPlanPlace({
  isResolved,
  location,
}: {
  isResolved: boolean;
  location: string;
}) {
  return (
    <div className="relative min-h-52 overflow-hidden rounded-xl bg-(--grouped-menu-selected) p-5 sm:p-6 lg:min-h-64">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,color-mix(in_srgb,var(--brand-teal)_15%,transparent),transparent_38%)]"
      />
      <div className="relative flex h-full min-h-42 items-center">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-foreground" aria-hidden="true" />
            <p className="font-bold text-muted-foreground text-xs">
              {isResolved ? "Meeting area" : "Location"}
            </p>
          </div>
          <p className="mt-4 font-extrabold text-2xl text-foreground leading-tight">
            {location}
          </p>
          <p className="mt-2 max-w-xs text-muted-foreground text-sm">
            {isResolved
              ? "The exact meeting point stays with members."
              : "The group will choose the place together."}
          </p>
        </div>
      </div>
    </div>
  );
}

function OnlinePlanPlace({ plan }: { plan: Plan }) {
  return (
    <div className="relative min-h-52 overflow-hidden rounded-xl bg-(--grouped-menu-selected) p-5 sm:p-6 lg:min-h-64">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,color-mix(in_srgb,var(--brand-teal)_18%,transparent),transparent_38%)]"
      />
      <div className="relative flex h-full min-h-42 flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-foreground">
            <MonitorUp className="size-5" aria-hidden="true" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 font-bold text-foreground text-xs">
            <Wifi className="size-3" aria-hidden="true" />
            Online
          </span>
        </div>
        <div>
          <p className="font-bold text-muted-foreground text-xs">
            Online meeting
          </p>
          <p className="mt-2 font-extrabold text-2xl text-foreground leading-tight">
            Meet from anywhere
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            {plan.isLocationResolved
              ? "Joining details are available to group members."
              : "The group will choose the online space together."}
          </p>
        </div>
      </div>
    </div>
  );
}

function LocationEmpty() {
  return (
    <div className="flex min-h-64 flex-col justify-end rounded-xl bg-(--grouped-menu-selected) p-5 sm:p-6 lg:min-h-72">
      <MapPin className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-4 font-extrabold text-foreground text-xl">
        No meeting place
      </p>
      <p className="mt-2 text-muted-foreground text-sm">
        A place will appear here when the first plan is created.
      </p>
    </div>
  );
}

function PlanNote({ detail, plan }: { detail: GroupPlanDetail; plan: Plan }) {
  if (
    !plan.description ||
    descriptionsOverlap(plan.description, detail.group.description)
  ) {
    return null;
  }

  return (
    <div className="rounded-xl bg-card px-5 py-4 sm:px-6 lg:px-7">
      <p className="font-bold text-muted-foreground text-xs">Plan note</p>
      <p className="mt-1 max-w-4xl text-pretty text-foreground/90 text-sm leading-relaxed">
        {plan.description}
      </p>
    </div>
  );
}

function OverviewFooter({
  detail,
  plan,
}: {
  detail: GroupPlanDetail;
  plan: Plan | null;
}) {
  const accessLabel =
    detail.group.access === "OPEN" ? "Open to join" : "By request";
  const visibilityLabel = formatGroupVisibility(detail.group.visibility);
  const remainingSpots = Math.max(
    0,
    detail.group.maxMembers -
      detail.group.activeMembersCount -
      detail.group.pendingInvitationsCount,
  );
  const memberValue = `${detail.group.activeMembersCount} ${
    detail.group.activeMembersCount === 1 ? "member" : "members"
  }`;
  const memberSupporting =
    remainingSpots > 0
      ? `${remainingSpots} ${remainingSpots === 1 ? "spot" : "spots"} open`
      : "Group is full";

  return (
    <div className="grouped-surface grid sm:grid-cols-3">
      <OverviewFact
        icon={detail.group.access === "OPEN" ? Globe2 : LockKeyhole}
        label="Access"
        value={accessLabel}
        supporting={visibilityLabel}
      />
      <OverviewFact
        icon={UsersRound}
        label="People"
        value={memberValue}
        supporting={memberSupporting}
      />
      <OverviewFact
        icon={Banknote}
        label="Cost"
        value={formatCost(plan)}
        supporting={formatCostSupporting(plan)}
      />
    </div>
  );
}

function formatCostSupporting(plan: Plan | null) {
  if (!plan) return undefined;
  if (plan.cost === "FREE") return "No payment needed";
  if (plan.depositAmountDecimal && plan.costCurrency) {
    return `Deposit ${plan.costCurrency} ${plan.depositAmountDecimal}`;
  }
  return plan.refundPolicy ?? plan.costDetails ?? undefined;
}

function OverviewFact({
  className,
  icon: Icon,
  label,
  supporting,
  value,
}: {
  className?: string;
  icon: typeof Globe2;
  label: string;
  supporting?: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-20 items-center gap-3 rounded-xl bg-card px-5 py-4 sm:px-6",
        className,
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="sr-only">{label}</p>
        <p className="font-extrabold text-foreground text-sm">{value}</p>
        {supporting ? (
          <p className="mt-0.5 truncate text-muted-foreground text-xs">
            {supporting}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function getCalendarParts(value: string | null): CalendarParts | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date),
  };
}

function getGoogleStaticMapUrl(latitude: number, longitude: number) {
  if (
    !scenarioRuntime.allows("maps") ||
    !config.googleMapsApiKey ||
    !config.googleStaticMapsEnabled
  ) {
    return null;
  }

  const params = new URLSearchParams({
    center: `${latitude},${longitude}`,
    zoom: "14",
    size: "640x420",
    scale: "2",
    maptype: "roadmap",
    markers: `color:0x14948d|${latitude},${longitude}`,
    key: config.googleMapsApiKey,
  });

  for (const style of GOOGLE_STATIC_MAP_STYLES) {
    params.append("style", style);
  }

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

function getGoogleMapsUrl(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    api: "1",
    query: `${latitude},${longitude}`,
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

const GOOGLE_STATIC_MAP_STYLES = [
  "element:geometry|color:0x17201f",
  "element:labels.text.fill|color:0x8e9a97",
  "element:labels.text.stroke|color:0x101514",
  "feature:administrative|element:geometry.stroke|color:0x31403d",
  "feature:poi|element:labels|visibility:off",
  "feature:road|element:geometry|color:0x2b3634",
  "feature:road|element:geometry.stroke|color:0x17201f",
  "feature:road.highway|element:geometry|color:0x3a4744",
  "feature:transit|element:labels|visibility:off",
  "feature:water|element:geometry|color:0x0b292c",
] as const;

const DESCRIPTION_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "each",
  "for",
  "group",
  "in",
  "of",
  "the",
  "to",
  "with",
]);

function descriptionsOverlap(
  planDescription: string,
  groupDescription: string | null,
) {
  if (!groupDescription) {
    return false;
  }

  const planTokens = meaningfulDescriptionTokens(planDescription);
  const groupTokens = meaningfulDescriptionTokens(groupDescription);
  if (planTokens.size === 0 || groupTokens.size === 0) {
    return false;
  }

  let shared = 0;
  for (const token of planTokens) {
    if (groupTokens.has(token)) {
      shared += 1;
    }
  }

  return shared / Math.min(planTokens.size, groupTokens.size) >= 0.45;
}

function meaningfulDescriptionTokens(value: string) {
  return new Set(
    value
      .toLocaleLowerCase()
      .replaceAll(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(
        (token) => token.length > 2 && !DESCRIPTION_STOP_WORDS.has(token),
      ),
  );
}
