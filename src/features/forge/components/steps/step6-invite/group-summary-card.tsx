import { Calendar, Check, MapPin, Users } from "lucide-react";
import type { ReactNode } from "react";

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

export function GroupSummaryCard({
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
}: GroupSummaryCardProps) {
  const coverPreset = getPlanCoverPreset(coverImage);
  const coverIsImageSource = Boolean(
    coverImage?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i),
  );
  const hasCover = Boolean(coverImage && (coverPreset || coverIsImageSource));
  const avatarIsImage = Boolean(
    avatarImage?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i),
  );
  const displayGroupName = groupName.trim() || planTitle || "Untitled group";
  const displayPlanTitle = planTitle || activityTitle || "Untitled plan";
  const displayDescription =
    groupDescription.trim() ||
    "The plan is ready. Finish now, then continue coordination from the group hub.";
  const statusLabel =
    forgeMode === "MANUAL" ? "Invites queued" : "Group formed";

  return (
    <section className="overflow-hidden rounded-lg border border-border/40 bg-card/70">
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
            <p className="w-fit rounded-full border border-white/10 bg-black/15 px-2.5 py-1 font-bold text-micro text-white/75 backdrop-blur">
              Final review
            </p>
          </div>
        )}
        <div
          className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/55"
          aria-hidden
        />
        <div className="absolute right-4 bottom-3 left-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-micro text-white/70">{statusLabel}</p>
            <p className="truncate font-black text-lg text-white leading-tight">
              {displayPlanTitle}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 font-bold text-white/95 text-xs backdrop-blur">
            <Check size={12} strokeWidth={2.5} />
            Ready
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={avatarIsImage ? avatarImage : null}
            name={displayGroupName}
            shape="rounded"
            className="size-11 rounded-lg border border-border bg-muted"
            fallbackClassName="text-micro font-bold"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-bold text-base text-foreground leading-tight">
              {displayGroupName}
            </h4>
            <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed sm:max-w-2xl">
              {displayDescription}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-border/25 border-t pt-3 sm:grid-cols-3">
          <SummaryItem
            icon={<Users size={14} />}
            label="People"
            value={`${participantCount} member${participantCount !== 1 ? "s" : ""}`}
          />
          <SummaryItem
            icon={<Calendar size={14} />}
            label="When"
            value={planDate || "Set later"}
          />
          <SummaryItem
            icon={<MapPin size={14} />}
            label="Where"
            value={planLocation || "Set later"}
          />
        </div>
      </div>
    </section>
  );
}

interface SummaryItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function SummaryItem({ icon, label, value }: SummaryItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-forge-teal/8 text-forge-teal">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-micro text-muted-foreground/60">
          {label}
        </span>
        <span className="block truncate font-semibold text-foreground text-xs">
          {value}
        </span>
      </span>
    </div>
  );
}
