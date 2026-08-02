import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Monitor,
  UsersRound,
} from "lucide-react";

import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import type { LocationMode, PlanScheduleMode } from "@/shared/schemas/enums";

import { getParticipantScorePercent } from "./participant-utils";

interface SuccessHeroProps {
  groupName: string;
  inviteeCount: number;
  locationType: LocationMode;
  planDate: string;
  planLocation: string;
  planScheduleMode: PlanScheduleMode;
  planTime: string;
  planTitle: string;
  participants: ForgeParticipant[];
  removedIds: Set<string>;
  targetSize: number;
}

export function SuccessHero({
  groupName,
  inviteeCount,
  locationType,
  planDate,
  planLocation,
  planScheduleMode,
  planTime,
  planTitle,
  participants,
  removedIds,
  targetSize,
}: SuccessHeroProps) {
  const activeParticipants = participants.filter(
    (participant) => !removedIds.has(participant.userId),
  );
  const averageScore = getAverageScore(activeParticipants);
  const displayName = groupName.trim() || planTitle.trim() || "Your group";
  const matchedCount = activeParticipants.length;
  const plannedCount = matchedCount + inviteeCount + 1;
  const openSeatCount = Math.max(0, targetSize - plannedCount);

  return (
    <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-forge-teal/20 ring-inset">
      <div className="sm:main-action-grid grid gap-5 px-4 py-5 sm:items-end sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-bold text-forge-teal text-sm">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Group found
          </p>
          <h3 className="mt-2 text-balance font-black text-2xl text-foreground tracking-tight">
            {displayName}
          </h3>
          <p className="mt-1 max-w-xl text-muted-foreground text-sm leading-relaxed">
            TeamForge found {matchedCount}{" "}
            {matchedCount === 1 ? "person" : "people"}
            {planTitle.trim() ? ` for ${planTitle.trim()}` : " for your plan"}.
          </p>
        </div>

        <div className="flex items-baseline gap-2 sm:block sm:text-right">
          <p className="font-black text-3xl text-foreground tabular-nums leading-none">
            {averageScore === null ? "Ready" : `${averageScore}%`}
          </p>
          <p className="mt-1 font-semibold text-muted-foreground text-xs">
            {averageScore === null ? "Group status" : "Average match"}
          </p>
        </div>
      </div>

      <dl className="grouped-surface grid sm:grid-cols-3">
        <SummaryFact
          icon={UsersRound}
          label="Group"
          value={`${plannedCount} of ${targetSize} people`}
          detail={
            openSeatCount > 0
              ? `${openSeatCount} ${openSeatCount === 1 ? "place" : "places"} still open`
              : inviteeCount > 0
                ? `${matchedCount} found + ${inviteeCount} invited + you`
                : `${matchedCount} found + you`
          }
        />
        <SummaryFact
          icon={CalendarDays}
          label="When"
          value={formatSchedule(planScheduleMode, planDate, planTime)}
          detail={
            planScheduleMode === "TO_BE_DECIDED"
              ? "Choose together"
              : "Planned time"
          }
        />
        <SummaryFact
          icon={locationType === "ONLINE" ? Monitor : MapPin}
          label="Where"
          value={formatLocation(locationType, planLocation)}
          detail={
            locationType === "ONLINE" ? "Virtual activity" : "Meeting place"
          }
        />
      </dl>
    </section>
  );
}

function SummaryFact({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 bg-card px-4 py-3.5 sm:px-5">
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0">
        <dt className="font-semibold text-muted-foreground text-xs">{label}</dt>
        <dd className="mt-0.5 truncate font-bold text-foreground text-sm">
          {value}
        </dd>
        <dd className="mt-0.5 text-muted-foreground/70 text-xs">{detail}</dd>
      </div>
    </div>
  );
}

function getAverageScore(participants: ForgeParticipant[]) {
  const scores = participants
    .map(getParticipantScorePercent)
    .filter((score): score is number => score !== null);

  if (scores.length === 0) {
    return null;
  }

  return Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length,
  );
}

function formatSchedule(
  mode: PlanScheduleMode,
  planDate: string,
  planTime: string,
) {
  if (mode === "TO_BE_DECIDED") {
    return "To be decided";
  }

  const date = formatDate(planDate);
  const time = planTime.trim();

  if (date && time) return `${date}, ${time}`;
  return date || time || "Time to confirm";
}

function formatDate(value: string) {
  if (!value.trim()) return "";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatLocation(locationType: LocationMode, planLocation: string) {
  if (locationType === "ONLINE") return "Online";
  return planLocation.trim() || "To be decided";
}
