import { Check, X } from "lucide-react";

import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { Image } from "@/shared/components/common/image";
import { PLAN_COVER_PRESETS } from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";

import type { PlanPhotoSectionProps } from "./types";

export function PlanPhotoSection({
  activePreset,
  coverImage,
  coverInputRef,
  coverUploadError,
  isCoverUploading,
  isImageCover,
  onCoverFiles,
  onCoverImageChange,
}: PlanPhotoSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-muted-foreground">
          Plan photo
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          This image appears on the plan card visible to all members.
        </p>
      </div>

      <div className="relative">
        <FileDropzone
          inputRef={coverInputRef}
          variant="cover"
          accept="image/*"
          title={coverImage ? "Change plan photo" : "Upload plan photo"}
          description="Drop a landscape image here or browse from your device."
          helper="PNG, JPG, WEBP up to 5 MB"
          actionLabel="Browse"
          isUploading={isCoverUploading}
          error={coverUploadError}
          onFiles={onCoverFiles}
          preview={
            coverImage ? (
              isImageCover ? (
                <Image
                  src={coverImage}
                  alt=""
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className={cn(
                    "h-full w-full bg-linear-to-br",
                    activePreset?.gradient ?? "from-muted/60 to-muted/20",
                  )}
                />
              )
            ) : null
          }
        />
        {coverImage && (
          <button
            type="button"
            onClick={() => onCoverImageChange(null)}
            className="absolute right-2 top-2 z-20 flex size-7 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
            aria-label="Remove cover"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PLAN_COVER_PRESETS.map(({ id, gradient, label }) => {
          const selected = coverImage === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onCoverImageChange(selected ? null : id)}
              aria-pressed={selected}
              className={cn(
                "group relative h-14 rounded-xl bg-linear-to-br transition duration-200 overflow-hidden border-2",
                gradient,
                selected
                  ? "border-primary shadow-md shadow-primary/20 scale-[1.04]"
                  : "border-transparent hover:scale-[1.03] hover:shadow-sm",
              )}
            >
              <span className="absolute bottom-1 left-1.5 text-micro font-bold text-white/85 drop-shadow-sm">
                {label}
              </span>
              {selected && (
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/95 flex items-center justify-center shadow-sm">
                  <Check size={9} className="text-primary" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
