import { PlanArtworkPendingVisual } from "@/features/forge/assets/plan-artwork-pending";
import { Avatar } from "@/shared/components/common/avatar";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { cn } from "@/shared/lib/utils";

import type { IdentityPreviewCardProps } from "./types";

interface IdentityPreviewViewState {
  avatarSrc: string | null;
  displayGroupName: string;
  displayPlanTitle: string;
  hasCover: boolean;
}

const IMAGE_SOURCE_PATTERN = /^(https?:\/\/|data:image\/|blob:|\/)/i;

export function IdentityPreviewCard(props: IdentityPreviewCardProps) {
  const preview = getIdentityPreviewViewState(props);

  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-semibold text-muted-foreground text-xs">Preview</p>
      <div className="group overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
        <IdentityPreviewCover
          coverImage={props.coverImage}
          displayPlanTitle={preview.displayPlanTitle}
          hasCover={preview.hasCover}
        />
        <IdentityPreviewBody preview={preview} />
      </div>
    </div>
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
    <div
      className={cn(
        "relative h-28 w-full overflow-hidden transition-colors duration-500",
        !hasCover &&
          "bg-linear-to-br from-forge-teal/18 via-canvas to-spark-amber/18",
      )}
    >
      {hasCover ? (
        <PlanCover
          value={coverImage}
          alt=""
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          imageClassName="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <span className="font-bold text-slate-muted text-xs">
              Artwork pending
            </span>
            <p className="mt-2 line-clamp-2 max-w-56 font-black text-foreground text-lg leading-tight">
              {displayPlanTitle}
            </p>
          </div>
          <PlanArtworkPendingVisual className="h-16 w-auto shrink-0 text-foreground" />
        </div>
      )}
      <div
        className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/45"
        aria-hidden
      />
    </div>
  );
}

function IdentityPreviewBody({
  preview,
}: {
  preview: IdentityPreviewViewState;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Avatar
        src={preview.avatarSrc}
        name={preview.displayGroupName}
        shape="rounded"
        className="size-11 rounded-lg border border-border bg-muted text-sm"
        fallbackClassName="text-micro"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold text-foreground text-sm">
          {preview.displayGroupName}
        </h3>
        <p className="mt-0.5 truncate text-muted-foreground text-xs">
          {preview.displayPlanTitle}
        </p>
      </div>
    </div>
  );
}

function getIdentityPreviewViewState({
  activePreset,
  activityTitle,
  avatarImage,
  coverImage,
  groupName,
  isImageAvatar,
  planTitle,
}: IdentityPreviewCardProps): IdentityPreviewViewState {
  return {
    avatarSrc: isImageAvatar ? avatarImage : null,
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
