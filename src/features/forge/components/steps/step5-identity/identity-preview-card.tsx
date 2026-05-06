import { Avatar } from "@/shared/components/common/avatar";
import { Image } from "@/shared/components/common/image";
import { cn } from "@/shared/lib/utils";

import type { IdentityPreviewCardProps } from "./types";

export function IdentityPreviewCard({
  activePreset,
  activityTitle,
  avatarImage,
  coverImage,
  groupName,
  isImageAvatar,
  isImageCover,
  planTitle,
}: IdentityPreviewCardProps) {
  const displayGroupName = groupName.trim() || planTitle || "Untitled group";
  const displayPlanTitle = planTitle || activityTitle || "Untitled plan";

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-muted-foreground">Preview</p>
      <div className="group overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div
          className={cn(
            "relative h-28 w-full overflow-hidden transition-colors duration-500",
            !isImageCover &&
              !activePreset &&
              "bg-linear-to-br from-forge-teal/18 via-canvas to-spark-amber/18",
            !isImageCover &&
              activePreset &&
              `bg-linear-to-br ${activePreset.gradient}`,
          )}
        >
          {isImageCover ? (
            <Image
              src={coverImage ?? undefined}
              alt=""
              className="h-full w-full object-cover transition-[scale,transform] duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col justify-between p-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-muted">
                Artwork pending
              </span>
              <p className="max-w-64 text-lg font-black leading-tight text-foreground line-clamp-2">
                {displayPlanTitle}
              </p>
            </div>
          )}
          <div
            className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/45"
            aria-hidden
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar
            src={isImageAvatar ? avatarImage : null}
            name={displayGroupName}
            shape="rounded"
            className="size-11 rounded-xl border border-border bg-muted text-sm"
            fallbackClassName="text-[11px]"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-foreground">
              {displayGroupName}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {displayPlanTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
