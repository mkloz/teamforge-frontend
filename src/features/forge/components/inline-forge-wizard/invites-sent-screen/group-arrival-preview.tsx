import { Check, UsersRound } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";

import type { InvitesSentSummary } from "./types";

const IMAGE_SOURCE_PATTERN = /^(https?:\/\/|data:image\/|blob:|\/)/i;

interface GroupArrivalPreviewProps {
  summary: InvitesSentSummary;
}

export function GroupArrivalPreview({ summary }: GroupArrivalPreviewProps) {
  const hasCover = hasRenderableCover(summary.coverImage);

  return (
    <section aria-label="New group" className="min-w-0">
      <div
        className={cn(
          "relative aspect-16/7 overflow-hidden rounded-xl lg:aspect-4/3",
          !hasCover &&
            "bg-linear-to-br from-forge-teal/18 via-card to-spark-amber/12",
        )}
      >
        {hasCover ? (
          <PlanCover
            value={summary.coverImage}
            alt=""
            className="size-full"
            imageClassName="size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-70" aria-hidden="true">
            <div className="absolute top-8 right-4 size-32 rounded-full bg-forge-teal/20 blur-3xl" />
            <div className="absolute bottom-4 left-2 size-24 rounded-full bg-spark-amber/14 blur-3xl" />
          </div>
        )}

        <div
          className="absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-black/60"
          aria-hidden="true"
        />

        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 font-bold text-white text-xs backdrop-blur-md">
          <Check className="size-3.5 text-forge-teal" strokeWidth={2.6} />
          Created
        </div>
      </div>

      <div className="relative px-1">
        <Avatar
          src={getAvatarSrc(summary.avatarImage)}
          name={summary.displayGroupName}
          shape="rounded"
          className="-mt-6 size-12 rounded-lg border-3 border-canvas bg-muted shadow-sm lg:-mt-8 lg:size-16 lg:rounded-xl lg:border-4"
          fallbackClassName="font-black text-sm"
        />

        <h2 className="mt-2 text-balance font-black text-foreground text-xl leading-tight tracking-tight lg:mt-3 lg:text-2xl">
          {summary.displayGroupName}
        </h2>
        <p className="mt-1 line-clamp-1 text-muted-foreground text-sm leading-relaxed lg:mt-1.5 lg:line-clamp-2">
          {summary.groupDescription}
        </p>

        <div className="mt-2.5 flex items-center gap-2 font-semibold text-muted-foreground text-xs lg:mt-4">
          <UsersRound
            className="size-3.5 text-forge-teal"
            strokeWidth={2}
            aria-hidden="true"
          />
          {summary.memberCount}{" "}
          {summary.memberCount === 1 ? "member" : "members"}
        </div>
      </div>
    </section>
  );
}

function hasRenderableCover(coverImage: string | null) {
  return Boolean(
    coverImage &&
      (getPlanCoverPreset(coverImage) || IMAGE_SOURCE_PATTERN.test(coverImage)),
  );
}

function getAvatarSrc(avatarImage: string | null) {
  return avatarImage && IMAGE_SOURCE_PATTERN.test(avatarImage)
    ? avatarImage
    : null;
}
