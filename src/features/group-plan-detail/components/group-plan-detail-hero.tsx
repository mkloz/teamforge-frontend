import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarClock,
  ImageOff,
  MapPin,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { GroupPlanActionDock } from "@/features/group-plan-detail/components/group-plan-action-dock";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatLocation,
  formatPlanDateTime,
  formatStatusLabel,
  getSeatsLabel,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { Avatar } from "@/shared/components/common/avatar";
import { Image } from "@/shared/components/common/image";
import { Button } from "@/shared/components/ui/button";

interface GroupPlanDetailHeroProps {
  detail: GroupPlanDetail;
}

export function GroupPlanDetailHero({ detail }: GroupPlanDetailHeroProps) {
  const planTime = formatPlanDateTime(detail.plan?.dateTime);
  const planTitle = detail.plan?.title ?? detail.activity.title;
  const location = formatLocation(detail);
  const leadMembers = detail.members.slice(0, 4);
  const heroSummary = getHeroSummary(detail);
  const heroReason = getHeroReason(detail);
  const photoMember = leadMembers.find((member) => member.avatar);
  const heroImageSource = detail.plan?.coverImage
    ? {
        alt: `${planTitle} plan photo`,
        src: detail.plan.coverImage,
      }
    : detail.group.avatar
      ? {
          alt: `${detail.group.name} group photo`,
          src: detail.group.avatar,
        }
      : photoMember?.avatar
        ? {
            alt: `${photoMember.name} profile photo`,
            src: photoMember.avatar,
          }
        : null;

  return (
    <header className="py-4 md:py-6">
      <Button asChild variant="ghost" size="sm" className="mb-5 px-0">
        <Link {...buildExploreNavigation()}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to groups
        </Link>
      </Button>

      <div className="lg:group-plan-hero-grid grid gap-8 lg:items-start xl:gap-12">
        <div className="min-w-0">
          <p className="font-black text-forge-teal text-xs uppercase tracking-widest">
            Group briefing
          </p>
          <h1 className="mt-3 max-w-4xl text-balance font-black text-4xl text-foreground leading-tight tracking-tight md:text-5xl">
            {planTitle}
          </h1>
          <p className="mt-4 max-w-3xl font-medium text-base text-muted-foreground leading-relaxed md:text-lg">
            {heroSummary}
          </p>
          <p className="mt-4 max-w-2xl font-semibold text-foreground text-sm leading-relaxed md:text-base">
            {heroReason}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Pill tone="teal">
              {detail.group.access === "OPEN" ? "Open group" : "Request needed"}
            </Pill>
            {detail.plan ? (
              <Pill tone="amber">{formatStatusLabel(detail.plan.status)}</Pill>
            ) : (
              <Pill>{formatStatusLabel(detail.group.status)}</Pill>
            )}
          </div>

          <div className="mt-6 max-w-2xl">
            <GroupPlanActionDock detail={detail} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
            <div className="relative aspect-video overflow-hidden bg-canvas">
              <Image
                src={heroImageSource?.src}
                alt={heroImageSource?.alt ?? "Group photo not set yet"}
                wrapperClassName="absolute inset-0"
                className="scale-100"
                noImageComponent={<HeroMediaFallback />}
                fallbackComponent={<HeroMediaFallback />}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent"
                aria-hidden="true"
              />
              <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3">
                <div className="flex">
                  {leadMembers.map((member) => (
                    <Avatar
                      key={member.userId}
                      src={member.avatar}
                      name={member.name}
                      className="-ml-2 size-10 border-2 border-canvas first:ml-0"
                    />
                  ))}
                </div>
                <p className="rounded-full border border-canvas/35 bg-ink/55 px-3 py-1 font-black text-canvas text-xs backdrop-blur-sm">
                  {detail.group.activeMembersCount}/{detail.group.maxMembers}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <HeroFact
              icon={<CalendarClock className="size-5" aria-hidden="true" />}
              label="When"
              value={planTime.full}
            />
            <HeroFact
              icon={<MapPin className="size-5" aria-hidden="true" />}
              label="Where"
              value={location}
            />
            <HeroFact
              icon={<UsersRound className="size-5" aria-hidden="true" />}
              label="Room"
              value={getSeatsLabel(detail)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function getHeroSummary(detail: GroupPlanDetail) {
  if (detail.group.name === detail.activity.title) {
    return "Here is the plan, the people already in, and the practical context you need before joining.";
  }

  return `${detail.group.name} is gathering around ${detail.activity.title}. Here is the plan, the people already in, and the practical context you need before joining.`;
}

function getHeroReason(detail: GroupPlanDetail) {
  const memberCount = detail.group.activeMembersCount;
  const seatsLeft = Math.max(0, detail.group.maxMembers - memberCount);
  const planStatus = detail.plan
    ? `${formatStatusLabel(detail.plan.status).toLowerCase()} plan`
    : "plan outline";

  if (seatsLeft === 0) {
    return `${memberCount} ${memberCount === 1 ? "person is" : "people are"} already in with a ${planStatus}. You can still see whether this group feels right.`;
  }

  return `${memberCount} ${memberCount === 1 ? "person is" : "people are"} already in with a ${planStatus}, and ${seatsLeft} ${seatsLeft === 1 ? "spot is" : "spots are"} still open.`;
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: "amber" | "neutral" | "teal";
}) {
  const className =
    tone === "teal"
      ? "border-forge-teal/20 bg-forge-teal/8 text-forge-teal"
      : tone === "amber"
        ? "border-spark-amber/25 bg-spark-amber/10 text-spark-amber"
        : "border-border bg-card text-muted-foreground";

  return (
    <span
      className={`rounded-full border px-3 py-1 font-bold text-xs uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

function HeroFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 text-forge-teal">{icon}</div>
      <div className="min-w-0">
        <p className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
          {label}
        </p>
        <p className="wrap-break-word mt-1 line-clamp-2 font-black text-foreground text-sm leading-snug">
          {value}
        </p>
      </div>
    </div>
  );
}

function HeroMediaFallback() {
  return (
    <div
      aria-label="Group photo not set yet"
      className="flex size-full items-center justify-center bg-canvas"
      role="img"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <ImageOff className="size-5" aria-hidden="true" />
        </span>
        <span className="max-w-40 font-bold text-muted-foreground text-xs leading-relaxed">
          Add a plan photo to make this group easier to recognise.
        </span>
      </div>
    </div>
  );
}
