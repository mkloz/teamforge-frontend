import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  Check,
  Cpu,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  LoaderCircle,
  type LucideIcon,
  Mountain,
  Music,
  Palette,
  Plane,
  Shapes,
  UserPlus,
  Users,
  UsersRound,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import { useJoinHomeRecommendedGroup } from "@/features/home/hooks/use-join-home-recommended-group";
import { Avatar } from "@/shared/components/common/avatar";
import {
  getGroupPlanCapacityModel,
  getGroupPlanMetaModel,
} from "@/shared/components/group-plan-card/group-plan-card-model";
import { Button } from "@/shared/components/ui/button";
import { useRequestFormationOpening } from "@/shared/hooks/use-request-formation-opening";
import {
  getExploreGroupDisplayName,
  getExploreGroupDisplayTitle,
  isExploreGroupFull,
} from "@/shared/lib/explore-group-presenters";
import { getPlanCategoryPresentation } from "@/shared/lib/plan-category-presentation";
import { cn } from "@/shared/lib/utils";
import type {
  ExploreFeedItem,
  ExploreFormationOpening,
  ExploreGroup,
  IntroductoryExploreGroup,
} from "@/shared/schemas";
import type { PlanCategory } from "@/shared/schemas/enums";
import {
  RecommendedGroupAction,
  RecommendedGroupDetailsLink,
} from "./recommended-group-card-parts";

interface OpenPlanRowProps {
  recommendation: ExploreFeedItem;
}

export function OpenPlanRow({ recommendation }: OpenPlanRowProps) {
  if (recommendation.type === "GROUP") {
    return <OpenGroupPlanRow group={recommendation.group} />;
  }

  if (recommendation.type === "INTRODUCTORY_GROUP") {
    return <IntroductoryGroupPlanRow group={recommendation.group} />;
  }

  return <FormationOpeningRow opening={recommendation.opening} />;
}

function IntroductoryGroupPlanRow({
  group,
}: {
  group: IntroductoryExploreGroup;
}) {
  const category = getPlanCategoryPresentation(group.plan?.category);
  const CategoryIcon = category.icon;
  const primaryInterest = group.activity.interests[0]?.name ?? category.label;
  const date = getPlanDateParts(null);
  const location =
    group.plan?.locationMode === "ONLINE"
      ? "Online"
      : group.plan?.locationMode === "IN_PERSON"
        ? "Meeting area shared later"
        : "Place decided together";

  return (
    <OpenPlanRowFrame
      action={
        <Button asChild size="sm" aria-label="Continue matching setup">
          <Link to="/onboarding/personality">
            <ArrowRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Continue setup</span>
          </Link>
        </Button>
      }
      date={date}
      image={
        <div
          className={cn(
            "grid size-16 place-items-center rounded-xl bg-linear-to-br text-white ring-1 ring-border/55 sm:size-20 sm:rounded-2xl",
            category.gradient,
          )}
        >
          <CategoryIcon className="size-6" aria-hidden="true" />
        </div>
      }
      location={location}
      spots={`${group.activeMembersCount} of ${group.maxMembers} members`}
      subtitle={`${group.interestFitPercentage}% shared-interest fit`}
      title={`${primaryInterest} group`}
    />
  );
}

function OpenGroupPlanRow({ group }: { group: ExploreGroup }) {
  const joinMutation = useJoinHomeRecommendedGroup(group.id);
  const capacity = getGroupPlanCapacityModel(group);
  const meta = getGroupPlanMetaModel(group);
  const date = getPlanDateParts(
    group.plan?.scheduleMode === "TO_BE_DECIDED" ? null : group.plan?.dateTime,
  );

  return (
    <OpenPlanRowFrame
      action={
        <RecommendedGroupAction
          group={group}
          isFull={isExploreGroupFull(group)}
          joinMutation={joinMutation}
        />
      }
      date={date}
      detailsLink={<RecommendedGroupDetailsLink group={group} />}
      image={
        <Avatar
          src={group.avatar}
          media={group.avatarMedia ?? null}
          name={group.name}
          imageSize={128}
          shape="rounded"
          className="size-16 rounded-xl bg-card ring-1 ring-border/55 sm:size-20 sm:rounded-2xl"
          fallbackClassName="text-base"
        />
      }
      location={meta.locationLabel}
      spots={formatGroupCapacity(capacity.spotsLeft)}
      subtitle={getExploreGroupDisplayName(group)}
      title={getExploreGroupDisplayTitle(group)}
    />
  );
}

function FormationOpeningRow({
  opening,
}: {
  opening: ExploreFormationOpening;
}) {
  const application = useRequestFormationOpening(opening);
  const CategoryIcon = PLAN_CATEGORY_ICONS[opening.category];
  const date = getPlanDateParts(
    opening.schedule.mode === "FIXED" ? opening.schedule.dateTime : null,
  );
  const isRequested = application.requestState === "requested";
  const isClosed = application.requestState === "closed";
  const isPending = application.isApplyPending || application.isWithdrawPending;
  const ActionIcon = isPending
    ? LoaderCircle
    : isRequested
      ? X
      : isClosed
        ? Check
        : UserPlus;
  const actionLabel = getOpeningActionLabel(application.requestState);

  return (
    <OpenPlanRowFrame
      action={
        <Button
          type="button"
          variant={isRequested ? "outline" : "primary"}
          size="sm"
          aria-label={actionLabel}
          disabled={!application.isOnline || isClosed || isPending}
          onClick={
            isRequested ? application.withdrawRequest : application.requestPlace
          }
          className="size-9 shrink-0 px-0 sm:h-9 sm:w-auto sm:px-3"
        >
          <ActionIcon
            className={cn("size-3.5", isPending && "animate-spin")}
            aria-hidden="true"
          />
          <span className="sr-only sm:not-sr-only">{actionLabel}</span>
        </Button>
      }
      date={date}
      image={
        <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15 sm:size-20 sm:rounded-2xl">
          <CategoryIcon className="size-7 sm:size-8" aria-hidden="true" />
        </div>
      }
      location={
        opening.scope === "ONLINE"
          ? "Online"
          : opening.broadArea || "Local area"
      }
      spots="1 place open"
      subtitle="Group forming"
      title={opening.activity.title}
    />
  );
}

interface OpenPlanRowFrameProps {
  action: ReactNode;
  date: PlanDateParts;
  detailsLink?: ReactNode;
  image: ReactNode;
  location: string;
  spots: string;
  subtitle: string;
  title: string;
}

function OpenPlanRowFrame({
  action,
  date,
  detailsLink,
  image,
  location,
  spots,
  subtitle,
  title,
}: OpenPlanRowFrameProps) {
  return (
    <li className="group relative grid min-h-24 grid-cols-[2.75rem_4rem_minmax(0,1fr)_auto] items-center gap-3 border-border/60 border-b py-3 first:border-t sm:grid-cols-[3.5rem_5rem_minmax(0,1fr)_auto] sm:gap-4 sm:py-4">
      {detailsLink ? (
        <div className="absolute inset-0 z-10">{detailsLink}</div>
      ) : null}

      <PlanDate date={date} />
      {image}

      <div className="grid min-w-0 grid-rows-[repeat(4,minmax(0,auto))] gap-1">
        <h3 className="truncate font-black text-foreground text-sm leading-tight transition-colors group-hover:text-primary sm:text-base">
          {title}
        </h3>
        <p className="truncate font-medium text-muted-foreground text-xs sm:text-sm">
          {subtitle}
        </p>
        <p className="truncate font-medium text-muted-foreground text-xs">
          {location}
        </p>
        <p className="inline-flex min-w-0 items-center gap-1.5 font-bold text-spark-amber text-xs">
          <UsersRound className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{spots}</span>
        </p>
      </div>

      <div className="relative z-20 flex shrink-0 items-center">{action}</div>
    </li>
  );
}

type PlanDateParts =
  | {
      kind: "scheduled";
      day: string;
      month: string;
      weekday: string;
    }
  | {
      kind: "open";
    };

function PlanDate({ date }: { date: PlanDateParts }) {
  return (
    <div className="relative flex h-full min-h-16 flex-col items-center justify-center border-border/70 border-l pl-2 text-center sm:min-h-20">
      <span
        className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full border-2 border-background bg-card ring-1 ring-border group-first:bg-forge-teal group-first:ring-forge-teal"
        aria-hidden="true"
      />
      {date.kind === "scheduled" ? (
        <>
          <span className="font-bold text-muted-foreground text-xs">
            {date.weekday}
          </span>
          <span className="font-black text-2xl text-foreground leading-none sm:text-3xl">
            {date.day}
          </span>
          <span className="font-semibold text-muted-foreground text-xs">
            {date.month}
          </span>
        </>
      ) : (
        <>
          <CalendarClock
            className="mb-1 size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="font-bold text-muted-foreground text-xs leading-tight">
            Date
            <br />
            open
          </span>
        </>
      )}
    </div>
  );
}

function getPlanDateParts(value?: string | null): PlanDateParts {
  if (!value) {
    return { kind: "open" };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { kind: "open" };
  }

  return {
    kind: "scheduled",
    day: new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(date),
    month: new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
    weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
      date,
    ),
  };
}

function formatGroupCapacity(spotsLeft: number | null) {
  if (spotsLeft === null) {
    return "Places available";
  }

  if (spotsLeft === 0) {
    return "Group full";
  }

  return `${spotsLeft} ${spotsLeft === 1 ? "place" : "places"} left`;
}

function getOpeningActionLabel(
  state: ReturnType<typeof useRequestFormationOpening>["requestState"],
) {
  if (state === "pending") return "Sending request";
  if (state === "requested") return "Withdraw request";
  if (state === "closed") return "Request closed";
  if (state === "error") return "Try again";
  return "Request to join";
}

const PLAN_CATEGORY_ICONS = {
  ARTS: Palette,
  FOOD: UtensilsCrossed,
  GAMING: Gamepad2,
  LEARNING: GraduationCap,
  MUSIC: Music,
  OTHER: Shapes,
  OUTDOORS: Mountain,
  SOCIAL: Users,
  SPORTS: Dumbbell,
  TECH: Cpu,
  TRAVEL: Plane,
  WELLNESS: HeartPulse,
} satisfies Record<PlanCategory, LucideIcon>;
