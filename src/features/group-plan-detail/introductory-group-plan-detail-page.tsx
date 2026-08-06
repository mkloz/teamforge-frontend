import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  Laptop,
  MapPin,
  UsersRound,
} from "lucide-react";

import type { IntroductoryGroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { getPlanCategoryPresentation } from "@/shared/lib/plan-category-presentation";
import { buildPersonalityEditNavigation } from "@/shared/navigation";

export function IntroductoryGroupPlanDetailPage({
  detail,
}: {
  detail: IntroductoryGroupPlanDetail;
}) {
  const category = getPlanCategoryPresentation(detail.plan?.category);
  const CategoryIcon = category.icon;
  const primaryInterest = detail.activity.interests[0]?.name ?? category.label;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 md:py-10 lg:px-8">
      <section className="overflow-hidden rounded-[1.5rem] bg-card">
        <div
          className={`relative min-h-72 overflow-hidden bg-linear-to-br ${category.gradient} sm:min-h-96`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgb(255_255_255/0.16),transparent_28%),linear-gradient(to_top,rgb(0_0_0/0.72),transparent_68%)]" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 p-5 text-white sm:p-8">
            <span className="inline-flex items-center gap-2 font-bold text-sm">
              <CategoryIcon className="size-5" aria-hidden="true" />
              Shared-interest preview
            </span>
            <div className="text-right">
              <span className="block font-black text-2xl tabular-nums leading-none">
                {detail.interestFitPercentage}%
              </span>
              <span className="mt-1 block font-semibold text-white/75 text-xs">
                interest fit
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
            <p className="font-bold text-sm text-white/70">{category.label}</p>
            <h1 className="mt-2 max-w-3xl font-black text-4xl leading-[0.98] tracking-[-0.045em] sm:text-6xl">
              {primaryInterest} group
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/76 leading-relaxed sm:text-lg">
              A limited preview based only on shared interests and structured
              plan settings.
            </p>
          </div>
        </div>

        <div className="grid gap-0.5 bg-background/70 sm:grid-cols-3">
          <PreviewFact
            icon={CalendarClock}
            label="When"
            value={
              detail.plan?.scheduleMode === "FIXED"
                ? "Scheduled plan"
                : "Decided together"
            }
          />
          <PreviewFact
            icon={detail.plan?.locationMode === "ONLINE" ? Laptop : MapPin}
            label="Where"
            value={getLocationLabel(detail)}
          />
          <PreviewFact
            icon={UsersRound}
            label="Group"
            value={`${detail.group.activeMembersCount} of ${detail.group.maxMembers} members`}
          />
        </div>
      </section>

      <section className="mt-5 flex flex-col gap-5 rounded-[1.25rem] bg-card px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="font-black text-xl">Finish your matching profile</h2>
          <p className="mt-1 max-w-2xl text-muted-foreground leading-relaxed">
            Complete the assessment to unlock names, messages, member details,
            and the exact plan.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link
            {...buildPersonalityEditNavigation({
              returnTo: "/groups/$groupId",
              returnGroupId: detail.group.id,
              returnSearch: "source=explore",
            })}
          >
            Continue setup
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </main>
  );
}

function PreviewFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-card px-5 py-5 sm:px-6">
      <Icon
        className="mt-0.5 size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="font-semibold text-muted-foreground text-xs">{label}</p>
        <p className="mt-1 font-bold text-base">{value}</p>
      </div>
    </div>
  );
}

function getLocationLabel(detail: IntroductoryGroupPlanDetail) {
  if (detail.plan?.locationMode === "ONLINE") return "Online";
  if (detail.plan?.locationMode === "IN_PERSON")
    return "Meeting area shared later";
  return "Decided together";
}
