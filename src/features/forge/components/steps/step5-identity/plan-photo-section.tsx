import { Check, Palette, X } from "lucide-react";

import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { Image } from "@/shared/components/common/image";
import { Button } from "@/shared/components/ui/button";
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
        <p className="mt-0.5 text-xs text-muted-foreground/60">
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
            coverImage && isImageCover ? (
              <Image
                src={coverImage}
                alt=""
                className="transition-[scale,transform] duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div
                className={cn(
                  "h-full w-full bg-linear-to-br",
                  activePreset?.gradient ??
                    "from-forge-teal/18 via-canvas to-spark-amber/18",
                )}
              />
            )
          }
        />
        {coverImage && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onCoverImageChange(null)}
            className="absolute top-2 right-2 z-20 size-7 rounded-full bg-black/45 text-white hover:bg-black/65 hover:text-white"
            aria-label="Remove cover"
          >
            <X size={13} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PLAN_COVER_PRESETS.map(({ id, gradient, label }) => {
          const selected = coverImage === id;

          return (
            <Button
              key={id}
              type="button"
              variant="ghost"
              onClick={() => onCoverImageChange(selected ? null : id)}
              aria-pressed={selected}
              className={cn(
                "group h-10 justify-start gap-2 rounded-lg border bg-card px-2.5 text-xs font-bold text-foreground shadow-none transition-[border-color,background-color,box-shadow,transform] duration-200 hover:bg-card active:scale-[0.98]",
                selected
                  ? "border-forge-teal/75 bg-forge-teal/8 text-forge-teal ring-1 ring-forge-teal/20"
                  : "border-border/45 hover:border-forge-teal/35 hover:bg-forge-teal/5",
              )}
            >
              <div
                className={cn(
                  "relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-linear-to-br ring-1 ring-white/15",
                  gradient,
                )}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-linear-to-b from-white/15 to-black/20" />
                {!selected && (
                  <Palette
                    size={10}
                    className="relative z-10 text-white/85 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  />
                )}
                {selected && (
                  <Check
                    size={11}
                    className="relative z-10 text-white"
                    strokeWidth={3}
                  />
                )}
              </div>
              <span className="truncate">{label}</span>
              <div
                className={cn(
                  "ml-auto size-1.5 rounded-full transition-colors duration-150",
                  selected ? "bg-forge-teal" : "bg-border/70",
                )}
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
