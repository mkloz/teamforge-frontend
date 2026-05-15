import { Check, Palette, X } from "lucide-react";

import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import {
  getPlanCoverPreset,
  PLAN_COVER_PRESETS,
} from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";

import type { PlanPhotoSectionProps } from "./types";

const MAX_VISIBLE_COVER_OPTIONS = 9;

interface CoverChoice {
  key: string;
  label: string;
  thumbnailSrc: string;
  value: string;
}

function getCoverChoices(templateCoverImage?: string | null): CoverChoice[] {
  const presetChoices = PLAN_COVER_PRESETS.map((preset) => ({
    key: preset.id,
    label: preset.label,
    thumbnailSrc: preset.src,
    value: preset.id,
  }));
  const templateCover = templateCoverImage?.trim();

  if (
    !templateCover ||
    getPlanCoverPreset(templateCover) ||
    PLAN_COVER_PRESETS.some((preset) => preset.src === templateCover)
  ) {
    return presetChoices;
  }

  return [
    {
      key: `template:${templateCover}`,
      label: "Template",
      thumbnailSrc: templateCover,
      value: templateCover,
    },
    ...presetChoices.slice(0, MAX_VISIBLE_COVER_OPTIONS - 1),
  ];
}

export function PlanPhotoSection({
  activePreset,
  coverImage,
  coverInputRef,
  coverUploadError,
  isCoverUploading,
  templateCoverImage,
  onCoverFiles,
  onCoverImageChange,
}: PlanPhotoSectionProps) {
  const coverChoices = getCoverChoices(templateCoverImage);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-semibold text-muted-foreground text-xs">
          Plan photo
        </p>
        <p className="mt-0.5 text-muted-foreground/60 text-xs">
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
          helper="PNG, JPG, WEBP up to 30 MB"
          actionLabel="Browse"
          isUploading={isCoverUploading}
          error={coverUploadError}
          onFiles={onCoverFiles}
          preview={
            coverImage ? (
              <PlanCover
                value={coverImage}
                alt=""
                className="transition-transform duration-700 ease-out group-hover:scale-105"
                imageClassName="transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div
                className={cn(
                  "size-full bg-linear-to-br",
                  activePreset?.kind === "gradient"
                    ? activePreset.gradient
                    : null,
                  !activePreset &&
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
            className="absolute top-2 right-2 z-20 size-7 rounded-full bg-black/45 text-white hover:bg-black/65"
            aria-label="Remove cover"
          >
            <X size={13} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {coverChoices.map((choice) => {
          const selected = coverImage === choice.value;

          return (
            <Button
              key={choice.key}
              type="button"
              variant="ghost"
              onClick={() => onCoverImageChange(selected ? null : choice.value)}
              aria-pressed={selected}
              className={cn(
                "group h-10 justify-start gap-2 rounded-lg border bg-card px-2.5 font-bold text-foreground text-xs shadow-none transition-all duration-200 active:scale-95",
                selected
                  ? "border-forge-teal/75 bg-forge-teal/8 text-forge-teal ring-1 ring-forge-teal/20"
                  : "border-border/45 hover:border-forge-teal/35 hover:bg-forge-teal/5",
              )}
            >
              <div
                className="relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md ring-1 ring-white/15"
                aria-hidden="true"
              >
                <img
                  src={choice.thumbnailSrc}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                />
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
              <span className="truncate">{choice.label}</span>
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
