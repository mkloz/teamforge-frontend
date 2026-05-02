import { Image } from "@/shared/components/common/image";
import { cn } from "@/shared/lib/utils";

import type { IdentityPreviewCardProps } from "./types";

export function IdentityPreviewCard({
  activePreset,
  activityTitle,
  avatarImage,
  isImageAvatar,
  isImageCover,
  planTitle,
}: IdentityPreviewCardProps) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-muted-foreground">Preview</p>
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div
          className={cn(
            "h-24 w-full transition-colors duration-500",
            isImageCover
              ? "bg-primary/15"
              : activePreset
                ? `bg-linear-to-br ${activePreset?.gradient}`
                : "bg-muted/40",
          )}
        />
        <div className="px-4 pb-4 pt-0 flex items-start gap-3">
          <div
            className={cn(
              "w-14 h-14 rounded-xl border-4 border-card -mt-7 shrink-0 shadow-md flex items-center justify-center transition-colors duration-300",
              isImageAvatar
                ? "bg-primary/20"
                : activePreset
                  ? `bg-linear-to-br ${activePreset?.gradient}`
                  : "bg-muted",
            )}
          >
            {isImageAvatar && (
              <Image
                src={avatarImage ?? undefined}
                alt=""
                className="rounded-lg"
              />
            )}
          </div>
          <div className="min-w-0 pt-2">
            <h3 className="text-sm font-bold text-foreground truncate">
              {planTitle || "Untitled Group"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activityTitle || "Activity not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
