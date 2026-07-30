import { Calendar, Check, MapPin, Users } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";

interface GroupSummaryCardProps {
  activityTitle: string;
  avatarImage: string | null;
  coverImage: string | null;
  forgeMode: "AUTO" | "MANUAL";
  groupDescription: string;
  groupName: string;
  participantCount: number;
  planDate: string;
  planLocation: string;
  planTitle: string;
}

interface GroupSummaryViewState {
  avatarSrc: string | null;
  displayDescription: string;
  displayGroupName: string;
  displayPlanTitle: string;
  hasCover: boolean;
  peopleValue: string;
  statusLabel: string;
  whenValue: string;
  whereValue: string;
}

const IMAGE_SOURCE_PATTERN = /^(https?:\/\/|data:image\/|blob:|\/)/i;
const DEFAULT_GROUP_DESCRIPTION =
  "A shared space for the plan, the people, and everything you decide next.";

export function GroupSummaryCard(props: GroupSummaryCardProps) {
  const summary = getGroupSummaryViewState(props);

  return (
    <section aria-label="Group preview" className="min-w-0">
      <SummaryCover
        coverImage={props.coverImage}
        hasCover={summary.hasCover}
        statusLabel={summary.statusLabel}
      />

      <div className="relative px-1">
        <div className="-mt-7 flex items-end gap-3">
          <Avatar
            src={summary.avatarSrc}
            name={summary.displayGroupName}
            shape="rounded"
            className="size-14 rounded-xl border-4 border-canvas bg-muted shadow-sm"
            fallbackClassName="font-black text-sm"
          />
          <p className="mb-1 truncate font-semibold text-forge-teal text-xs">
            {summary.displayPlanTitle}
          </p>
        </div>

        <h3 className="mt-3 font-black text-2xl text-foreground tracking-tight">
          {summary.displayGroupName}
        </h3>
        <p className="mt-1.5 max-w-xl text-muted-foreground text-sm leading-relaxed">
          {summary.displayDescription}
        </p>

        <dl className="mt-5 grid grid-cols-1 border-border/45 border-y sm:grid-cols-3 sm:divide-x sm:divide-border/35">
          <SummaryFact
            icon={Users}
            label="People"
            value={summary.peopleValue}
          />
          <SummaryFact icon={Calendar} label="When" value={summary.whenValue} />
          <SummaryFact icon={MapPin} label="Where" value={summary.whereValue} />
        </dl>
      </div>
    </section>
  );
}

interface SummaryCoverProps {
  coverImage: string | null;
  hasCover: boolean;
  statusLabel: string;
}

function SummaryCover({
  coverImage,
  hasCover,
  statusLabel,
}: SummaryCoverProps) {
  return (
    <div
      className={cn(
        "relative aspect-16/7 min-h-36 overflow-hidden rounded-xl",
        !hasCover &&
          "bg-linear-to-br from-forge-teal/18 via-card to-spark-amber/12",
      )}
    >
      {hasCover ? (
        <PlanCover
          value={coverImage}
          alt=""
          className="size-full"
          imageClassName="size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 opacity-60" aria-hidden="true">
          <div className="absolute top-6 right-10 size-28 rounded-full bg-forge-teal/16 blur-3xl" />
          <div className="absolute bottom-2 left-12 size-24 rounded-full bg-spark-amber/12 blur-3xl" />
        </div>
      )}

      <div
        className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/65"
        aria-hidden="true"
      />

      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 font-bold text-white text-xs backdrop-blur-md">
        <Check className="size-3.5 text-forge-teal" strokeWidth={2.6} />
        {statusLabel}
      </div>
    </div>
  );
}

interface SummaryFactProps {
  icon: typeof Users;
  label: string;
  value: string;
}

function SummaryFact({ icon: Icon, label, value }: SummaryFactProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 py-3 sm:px-3 first:sm:pl-0">
      <Icon
        className="size-3.5 shrink-0 text-forge-teal"
        strokeWidth={2}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="font-semibold text-muted-foreground/70 text-xs">
          {label}
        </dt>
        <dd className="truncate font-bold text-foreground text-xs">{value}</dd>
      </div>
    </div>
  );
}

function getGroupSummaryViewState({
  activityTitle,
  avatarImage,
  coverImage,
  forgeMode,
  groupDescription,
  groupName,
  participantCount,
  planDate,
  planLocation,
  planTitle,
}: GroupSummaryCardProps): GroupSummaryViewState {
  return {
    avatarSrc: getAvatarSrc(avatarImage),
    displayDescription: getDisplayDescription(groupDescription),
    displayGroupName: getDisplayGroupName(groupName, planTitle),
    displayPlanTitle: getDisplayPlanTitle(planTitle, activityTitle),
    hasCover: hasRenderableCover(coverImage),
    peopleValue: getPeopleValue(participantCount),
    statusLabel: getStatusLabel(forgeMode),
    whenValue: getSetLaterValue(planDate),
    whereValue: getSetLaterValue(planLocation),
  };
}

function getAvatarSrc(avatarImage: string | null) {
  return isRenderableImageSource(avatarImage) ? avatarImage : null;
}

function getDisplayGroupName(groupName: string, planTitle: string) {
  return groupName.trim() || planTitle || "Untitled group";
}

function getDisplayPlanTitle(planTitle: string, activityTitle: string) {
  return planTitle || activityTitle || "Untitled plan";
}

function getDisplayDescription(groupDescription: string) {
  return groupDescription.trim() || DEFAULT_GROUP_DESCRIPTION;
}

function getPeopleValue(participantCount: number) {
  return `${participantCount} member${participantCount !== 1 ? "s" : ""}`;
}

function getStatusLabel(forgeMode: GroupSummaryCardProps["forgeMode"]) {
  return forgeMode === "MANUAL" ? "Ready to invite" : "Group ready";
}

function getSetLaterValue(value: string) {
  return value || "Decide together";
}

function hasRenderableCover(coverImage: string | null) {
  const coverPreset = getPlanCoverPreset(coverImage);

  return Boolean(
    coverImage && (coverPreset || isRenderableImageSource(coverImage)),
  );
}

function isRenderableImageSource(value: string | null) {
  return Boolean(value?.match(IMAGE_SOURCE_PATTERN));
}
