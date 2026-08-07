import { Check, X } from "lucide-react";

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

interface CoverChoiceButtonProps {
  choice: CoverChoice;
  isOnline: boolean;
  selected: boolean;
  onCoverImageChange: (url: string | null) => void;
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

function PlanPhotoPreview({
  activePreset,
  coverImage,
}: Pick<PlanPhotoSectionProps, "activePreset" | "coverImage">) {
  if (coverImage) {
    return <UploadedPlanPhotoPreview coverImage={coverImage} />;
  }

  return <PresetPlanPhotoPreview activePreset={activePreset} />;
}

function UploadedPlanPhotoPreview({ coverImage }: { coverImage: string }) {
  return (
    <PlanCover
      value={coverImage}
      alt=""
      className="transition-transform duration-700 ease-out group-hover:scale-105"
      imageClassName="transition-transform duration-700 ease-out group-hover:scale-105"
    />
  );
}

function PresetPlanPhotoPreview({
  activePreset,
}: Pick<PlanPhotoSectionProps, "activePreset">) {
  return (
    <div
      className={cn(
        "size-full bg-linear-to-br",
        getPresetGradient(activePreset),
      )}
    />
  );
}

function getPresetGradient(
  activePreset: PlanPhotoSectionProps["activePreset"],
) {
  if (activePreset?.kind === "gradient") {
    return activePreset.gradient;
  }

  if (!activePreset) {
    return "from-forge-teal/18 via-canvas to-spark-amber/18";
  }

  return null;
}

function getCoverChoiceButtonClassName(selected: boolean) {
  return cn(
    "group relative aspect-4/3 h-auto w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-card p-0 shadow-none transition-[background-color,border-color,box-shadow,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 motion-reduce:transition-none sm:w-22",
    selected
      ? "border-forge-teal ring-2 ring-forge-teal/15"
      : "border-transparent hover:border-forge-teal/45",
  );
}

function getCoverChoiceTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before changing group images.";
}

function CoverChoiceButton({
  choice,
  isOnline,
  selected,
  onCoverImageChange,
}: CoverChoiceButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onCoverImageChange(selected ? null : choice.value)}
      aria-pressed={selected}
      disabled={!isOnline}
      title={getCoverChoiceTitle(isOnline)}
      className={getCoverChoiceButtonClassName(selected)}
      contentClassName="relative block size-full"
    >
      <img
        src={choice.thumbnailSrc}
        alt=""
        className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/10" />
      <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-1 text-left font-bold text-[10px] text-white backdrop-blur-sm">
        {choice.label}
      </span>
      {selected ? (
        <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-forge-teal text-white shadow-sm">
          <Check size={11} strokeWidth={3} />
        </span>
      ) : null}
    </Button>
  );
}

export function PlanPhotoSection({
  activePreset,
  coverImage,
  coverInputRef,
  coverUploadError,
  isCoverUploading,
  isOnline,
  templateCoverImage,
  onCoverFiles,
  onCoverImageChange,
}: PlanPhotoSectionProps) {
  const coverChoices = getCoverChoices(templateCoverImage);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-semibold text-foreground text-sm">Plan cover</p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {isOnline
            ? "Use the current image, upload another, or choose a style."
            : "Reconnect before changing the plan photo."}
        </p>
      </div>

      <div className="relative">
        <FileDropzone
          inputRef={coverInputRef}
          variant="cover"
          dropzoneClassName="min-h-36"
          accept="image/*"
          title={coverImage ? "Change plan photo" : "Upload plan photo"}
          description="Drop a landscape image here or browse from your device."
          helper="PNG, JPG, WEBP up to 30 MB"
          actionLabel="Browse"
          disabled={!isOnline}
          isUploading={isCoverUploading}
          error={coverUploadError}
          onFiles={onCoverFiles}
          preview={
            <PlanPhotoPreview
              activePreset={activePreset}
              coverImage={coverImage}
            />
          }
        />
        {coverImage && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={!isOnline}
            onClick={() => onCoverImageChange(null)}
            className="absolute top-2 right-2 z-20 size-7 rounded-full bg-black/45 text-white hover:bg-black/65"
            aria-label="Remove cover"
            title={getCoverChoiceTitle(isOnline)}
          >
            <X size={13} />
          </Button>
        )}
      </div>

      <fieldset className="-mx-1 min-w-0">
        <legend className="sr-only">Cover styles</legend>
        <div className="flex gap-2 overflow-x-auto px-1 pb-2">
          {coverChoices.map((choice) => (
            <CoverChoiceButton
              key={choice.key}
              choice={choice}
              isOnline={isOnline}
              selected={coverImage === choice.value}
              onCoverImageChange={onCoverImageChange}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
