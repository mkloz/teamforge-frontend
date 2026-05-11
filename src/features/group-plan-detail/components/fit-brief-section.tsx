import {
  Gauge,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  GroupPlanDetail,
  GroupPlanFitSignal,
} from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getFitPercent } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { cn } from "@/shared/lib/utils";

interface FitBriefSectionProps {
  detail: GroupPlanDetail;
}

const signalIcons: Record<GroupPlanFitSignal["key"], ReactNode> = {
  SHARED_INTERESTS: <Sparkles className="size-4" aria-hidden="true" />,
  SOCIAL_PACE: <UsersRound className="size-4" aria-hidden="true" />,
  LOCATION: <MapPin className="size-4" aria-hidden="true" />,
  KNOWN_CONNECTION: <Network className="size-4" aria-hidden="true" />,
  RELIABILITY: <ShieldCheck className="size-4" aria-hidden="true" />,
  LIFE_STAGE: <Gauge className="size-4" aria-hidden="true" />,
};

export function FitBriefSection({ detail }: FitBriefSectionProps) {
  const fit = detail.fit;
  const fitPercent = getFitPercent(fit?.totalScore);
  const fitVerdict = getFitVerdict(fitPercent);
  const fitNarrative = getFitNarrative(detail, fitPercent);
  const signals = fit?.signals ?? [];

  return (
    <section
      aria-labelledby="fit-brief-heading"
      className="border-border/70 border-b pb-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="font-black text-forge-teal text-xs uppercase tracking-widest">
            Why this group
          </p>
          <h2
            id="fit-brief-heading"
            className="mt-2 font-black text-2xl text-foreground tracking-tight"
          >
            Fit brief
          </h2>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            {fit?.summary ??
              "TeamForge does not have enough context yet, so this view keeps the decision grounded in the plan and people."}
          </p>
          <p className="mt-4 max-w-3xl font-medium text-base text-foreground leading-relaxed">
            {fitNarrative}
          </p>
        </div>

        <div className="max-w-48 border-border border-l-0 pt-0 md:border-l md:pl-5">
          <p className="font-black text-2xl text-foreground leading-tight">
            {fitVerdict}
          </p>
          <p className="mt-1 font-bold text-muted-foreground text-sm">
            {fitPercent === null
              ? "Fit score will appear once there is enough context."
              : `${fitPercent}% fit`}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {signals.length > 0 ? (
          signals.map((signal) => (
            <article key={signal.key} className="flex min-w-0 gap-3">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border",
                  signal.strength === "HIGH" &&
                    "border-forge-teal/20 bg-forge-teal/8 text-forge-teal",
                  signal.strength === "MEDIUM" &&
                    "border-spark-amber/25 bg-spark-amber/10 text-spark-amber",
                  signal.strength === "LOW" &&
                    "border-border bg-card text-muted-foreground",
                )}
              >
                {signalIcons[signal.key]}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-foreground text-sm">
                    {signal.label}
                  </h3>
                  <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
                    {signal.strength.toLowerCase()}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                  {signal.detail}
                </p>
              </div>
            </article>
          ))
        ) : (
          <article className="flex gap-3 md:col-span-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              <UsersRound className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-black text-foreground text-sm">
                Fit cues are still settling
              </h3>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                You can still judge the group from the plan, members, and safety
                notes while TeamForge gathers more context.
              </p>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function getFitVerdict(fitPercent: number | null) {
  if (fitPercent === null) {
    return "Fit still settling";
  }

  if (fitPercent >= 75) {
    return "Strong practical fit";
  }

  if (fitPercent >= 60) {
    return "Useful overlap";
  }

  if (fitPercent >= 45) {
    return "Some shared ground";
  }

  return "Worth a closer look";
}

function getFitNarrative(detail: GroupPlanDetail, fitPercent: number | null) {
  const seatsLeft = Math.max(
    0,
    detail.group.maxMembers - detail.group.activeMembersCount,
  );
  const seatsText =
    seatsLeft > 0
      ? `there ${seatsLeft === 1 ? "is" : "are"} ${seatsLeft} ${seatsLeft === 1 ? "spot" : "spots"} open`
      : "no open spots right now";
  const location = detail.activity.city
    ? `the plan is set around ${detail.activity.city}`
    : detail.plan?.locationMode === "ONLINE"
      ? "the plan is online"
      : "the practical details are clear";
  const cost = detail.plan?.cost === "FREE" ? "it is free" : null;
  const planStatus = detail.plan
    ? formatPlanStatusForSentence(detail.plan.status)
    : "the outline is clear";
  const practicalBits = [planStatus, location, cost, seatsText]
    .filter(Boolean)
    .join("; ");

  if (fitPercent === null) {
    return `Start with the practical bits: ${practicalBits}.`;
  }

  if (fitPercent >= 60) {
    return `The practical fit is solid: ${practicalBits}.`;
  }

  return `This one needs a closer read, but the basics are clear: ${practicalBits}.`;
}

function formatPlanStatusForSentence(
  status: NonNullable<GroupPlanDetail["plan"]>["status"],
) {
  if (status === "CONFIRMED") {
    return "the plan is confirmed";
  }

  if (status === "IN_PROGRESS") {
    return "the plan is already underway";
  }

  return "the plan is still being shaped";
}
