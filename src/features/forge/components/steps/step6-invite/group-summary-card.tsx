import { Calendar, Check, type LucideIcon, MapPin, Users } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { FactItem } from "@/shared/components/ui/fact-item";
import { StatusPill } from "@/shared/components/ui/status-pill";
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
  "The plan is ready. Finish now, then continue in the group workspace.";

export function GroupSummaryCard(props: GroupSummaryCardProps) {
  const summary = getGroupSummaryViewState(props);

  return (
    <section className="overflow-hidden rounded-lg border border-border/40 bg-card/70">
      <SummaryCover
        coverImage={props.coverImage}
        displayPlanTitle={summary.displayPlanTitle}
        hasCover={summary.hasCover}
        statusLabel={summary.statusLabel}
      />

      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={summary.avatarSrc}
            name={summary.displayGroupName}
            shape="rounded"
            className="size-11 rounded-lg border border-border bg-muted"
            fallbackClassName="font-bold text-xs"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-bold text-base text-foreground leading-tight">
              {summary.displayGroupName}
            </h4>
            <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed sm:max-w-2xl">
              {summary.displayDescription}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-border/25 border-t pt-3 sm:grid-cols-3">
          <SummaryItem
            icon={Users}
            label="People"
            value={summary.peopleValue}
          />
          <SummaryItem icon={Calendar} label="When" value={summary.whenValue} />
          <SummaryItem icon={MapPin} label="Where" value={summary.whereValue} />
        </div>
      </div>
    </section>
  );
}

interface SummaryCoverProps {
  coverImage: string | null;
  displayPlanTitle: string;
  hasCover: boolean;
  statusLabel: string;
}

function SummaryCover({
  coverImage,
  displayPlanTitle,
  hasCover,
  statusLabel,
}: SummaryCoverProps) {
  return (
    <div
      className={cn(
        "relative h-28 overflow-hidden transition-colors duration-500 sm:h-32",
        !hasCover &&
          "bg-linear-to-br from-forge-teal/16 via-canvas to-spark-amber/16",
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
        <div className="flex h-full items-start p-4">
          <StatusPill
            tone="none"
            className="w-fit border-white/10 bg-black/15 px-2.5 py-1 text-white/75 backdrop-blur"
          >
            Final review
          </StatusPill>
        </div>
      )}
      <div
        className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/55"
        aria-hidden
      />
      <div className="absolute right-4 bottom-3 left-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-white/70 text-xs">{statusLabel}</p>
          <p className="truncate font-black text-lg text-white leading-tight">
            {displayPlanTitle}
          </p>
        </div>
        <StatusPill
          icon={Check}
          size="sm"
          tone="none"
          className="border-white/15 bg-black/25 px-2.5 py-1 text-white/95 backdrop-blur"
        >
          Ready
        </StatusPill>
      </div>
    </div>
  );
}

interface SummaryItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function SummaryItem({ icon, label, value }: SummaryItemProps) {
  return (
    <FactItem
      icon={icon}
      iconSize="sm"
      iconTone="teal"
      iconTileClassName="bg-forge-teal/8"
      label={label}
      labelClassName="font-bold text-muted-foreground/60 text-xs"
      value={value}
      valueClassName="truncate text-xs"
    />
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
  return forgeMode === "MANUAL" ? "Invites queued" : "Group formed";
}

function getSetLaterValue(value: string) {
  return value || "Set later";
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
