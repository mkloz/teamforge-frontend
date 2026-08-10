import { Image } from "lucide-react";
import { PlanSummaryFact } from "@/features/plan-creation/components/plan-creation-snapshot-elements";
import { Avatar } from "@/shared/components/common/avatar";
import { PlanCover } from "@/shared/components/common/plan-cover";

import type { IdentityPreviewCardProps } from "./types";

interface IdentityPreviewViewState {
  avatarSrc: string | null;
  displayActivity: string;
  displayDescription: string;
  displayGroupName: string;
  displayPlanTitle: string;
  hasCover: boolean;
}

const IMAGE_SOURCE_PATTERN = /^(https?:\/\/|data:image\/|blob:|\/)/i;
const DEFAULT_DESCRIPTION =
  "Add a short description so members know what brings this group together.";

export function IdentityPreviewCard(props: IdentityPreviewCardProps) {
  const preview = getIdentityPreviewViewState(props);

  return (
    <aside
      aria-label="Live group preview"
      className="border-border/35 border-t pt-7 lg:sticky lg:top-28 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-bold text-foreground text-sm">Group preview</p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Updates as you edit.
          </p>
        </div>
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-brand-teal"
        />
      </div>

      <div className="mt-5">
        <div className="relative pb-7">
          <IdentityPreviewCover
            coverImage={props.coverImage}
            displayPlanTitle={preview.displayPlanTitle}
            hasCover={preview.hasCover}
          />
          <Avatar
            src={preview.avatarSrc}
            name={preview.displayGroupName}
            shape="rounded"
            className="absolute bottom-0 left-4 size-14 rounded-xl border-4 border-canvas bg-card text-sm shadow-sm"
            fallbackClassName="font-bold text-xs"
          />
        </div>

        <h3 className="mt-3 text-balance font-black text-foreground text-xl leading-tight tracking-tight">
          {preview.displayGroupName}
        </h3>
        <p className="mt-2 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
          {preview.displayDescription}
        </p>
      </div>

      <dl className="mt-5 border-border/35 border-y py-2">
        <PlanSummaryFact label="Plan" value={preview.displayPlanTitle} />
        <PlanSummaryFact label="Focus" value={preview.displayActivity} />
      </dl>
    </aside>
  );
}

function IdentityPreviewCover({
  coverImage,
  displayPlanTitle,
  hasCover,
}: {
  coverImage: string | null;
  displayPlanTitle: string;
  hasCover: boolean;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-card">
      {hasCover ? (
        <PlanCover
          value={coverImage}
          alt=""
          className="size-full overflow-hidden rounded-2xl"
          imageClassName="size-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-between gap-3 px-4 py-3">
          <p className="line-clamp-2 max-w-36 font-black text-base text-foreground leading-tight">
            {displayPlanTitle}
          </p>
          <Image
            className="size-7 shrink-0 text-muted-foreground/45"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-black/10" />
    </div>
  );
}

function getIdentityPreviewViewState({
  activePreset,
  activityTitle,
  avatarImage,
  coverImage,
  groupDescription,
  groupName,
  isImageAvatar,
  planTitle,
}: IdentityPreviewCardProps): IdentityPreviewViewState {
  return {
    avatarSrc: isImageAvatar ? avatarImage : null,
    displayActivity: activityTitle || "Shared activity",
    displayDescription: groupDescription.trim() || DEFAULT_DESCRIPTION,
    displayGroupName: groupName.trim() || planTitle || "Untitled group",
    displayPlanTitle: planTitle || activityTitle || "Untitled plan",
    hasCover: hasIdentityPreviewCover(activePreset, coverImage),
  };
}

function hasIdentityPreviewCover(
  activePreset: IdentityPreviewCardProps["activePreset"],
  coverImage: string | null,
) {
  return Boolean(
    coverImage && (activePreset || coverImage.match(IMAGE_SOURCE_PATTERN)),
  );
}
