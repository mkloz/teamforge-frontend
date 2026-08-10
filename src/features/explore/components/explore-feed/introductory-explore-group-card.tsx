import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  Laptop,
  MapPin,
  UsersRound,
} from "lucide-react";

import { getPlanCategoryPresentation } from "@/shared/lib/plan-category-presentation";
import { cn } from "@/shared/lib/utils";
import {
  buildGroupPlanDetailNavigation,
  buildPersonalityEditNavigation,
} from "@/shared/navigation";
import type { IntroductoryExploreGroup } from "@/shared/schemas";

interface IntroductoryExploreGroupCardProps {
  emphasis: "lead" | "standard";
  group: IntroductoryExploreGroup;
  imagePriority?: "auto" | "high";
}

export function IntroductoryExploreGroupCard({
  emphasis,
  group,
}: IntroductoryExploreGroupCardProps) {
  const category = getPlanCategoryPresentation(group.plan?.category);
  const CategoryIcon = category.icon;
  const primaryInterest = group.activity.interests[0]?.name ?? category.label;
  const isLead = emphasis === "lead";

  return (
    <article className="group relative size-full min-h-92 overflow-hidden rounded-[1.25rem] bg-card shadow-soft-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-soft-md sm:min-h-96 md:min-h-0">
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-linear-to-br opacity-70 transition-transform duration-500 ease-out group-hover:scale-[1.025]",
          category.gradient,
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgb(255_255_255/0.16),transparent_28%),linear-gradient(to_top,rgb(0_0_0/0.72),transparent_68%)]" />

      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 text-white sm:p-5">
        <span className="inline-flex items-center gap-2 font-bold text-xs">
          <CategoryIcon className="size-4" aria-hidden="true" />
          Shared-interest preview
        </span>
        <div className="text-right">
          <span className="block font-black text-xl tabular-nums leading-none">
            {group.interestFitPercentage}%
          </span>
          <span className="mt-1 block font-semibold text-white/75 text-xs">
            interest fit
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-white sm:p-5">
        <p className="font-semibold text-white/72 text-xs">{category.label}</p>
        <h3
          className={cn(
            "mt-1 line-clamp-2 font-black leading-[1.02] tracking-[-0.035em]",
            isLead ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
          )}
        >
          {primaryInterest} group
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-white/14 border-t pt-3 text-white/78 text-xs">
          <IntroductoryMeta
            icon={CalendarClock}
            label={getScheduleLabel(group)}
          />
          <IntroductoryMeta
            icon={group.plan?.locationMode === "ONLINE" ? Laptop : MapPin}
            label={getLocationLabel(group)}
          />
          <IntroductoryMeta
            icon={UsersRound}
            label={`${group.activeMembersCount} of ${group.maxMembers} members`}
          />
          <span className="truncate font-semibold">{primaryInterest}</span>
        </div>

        <div className="relative z-30 mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-64 text-white/65 text-xs leading-snug">
            Names, messages, and exact plan details unlock after your matching
            profile is ready.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              {...buildGroupPlanDetailNavigation(group.id, {
                source: "explore",
              })}
              className="inline-flex items-center rounded-full border border-white/28 px-4 py-2 font-bold text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              View preview
            </Link>
            <Link
              {...buildPersonalityEditNavigation({
                returnTo: "/groups/$groupId",
                returnGroupId: group.id,
                returnSearch: "source=explore",
              })}
              className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-4 py-2 font-bold text-sm text-white transition-colors hover:bg-brand-teal/85 focus-visible:outline-2 focus-visible:outline-brand-teal focus-visible:outline-offset-2"
            >
              Continue setup
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function IntroductoryMeta({
  icon: Icon,
  label,
}: {
  icon: typeof CalendarClock;
  label: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate font-semibold">{label}</span>
    </span>
  );
}

function getLocationLabel(group: IntroductoryExploreGroup) {
  if (group.plan?.locationMode === "ONLINE") return "Online";
  if (group.plan?.locationMode === "IN_PERSON")
    return "Meeting area shared later";
  return "Place decided together";
}

function getScheduleLabel(group: IntroductoryExploreGroup) {
  return group.plan?.scheduleMode === "FIXED"
    ? "Scheduled plan"
    : "Time decided together";
}
